package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"google.golang.org/api/option"
)

type TripPlanRequest struct {
	Prompt string `json:"prompt"`
}

type TravelItem struct {
	Type            string       `json:"type"`
	From            string       `json:"from"`
	FromRecord      *core.Record `json:"from_record"`
	FromCountryISO2 string       `json:"from_country_iso2"`
	To              string       `json:"to"`
	ToRecord        *core.Record `json:"to_record"`
	ToCountryISO2   string       `json:"to_country_iso2"`
	StartDay        int          `json:"start_day"`
	ArrivalDay      int          `json:"arrival_day"`
	Order           int          `json:"order"`
}

type DayPlan struct {
	Day         int    `json:"day"`
	Description string `json:"description"`
}

type TripPlan struct {
	Name        string       `json:"name"`
	Description string       `json:"description"`
	TravelItems []TravelItem `json:"travel_items"`
	Days        []DayPlan    `json:"days"`
}

// Custom error for when a city is not found in the database
var ErrCityNotFound = errors.New("city not found in database")

// Function to find city ID by normalized name and country ISO2 code
func getCityRecordByName(pb *pocketbase.PocketBase, cityName string, countryISO2Hint string) (*core.Record, error) {
	// Normalize the input city name for the query parameter
	normalizedCityName := strings.ToLower(cityName)
	// Prepare variations for matching within comma-separated string
	nameComma := normalizedCityName + ","
	commaNameComma := "," + normalizedCityName + ","
	commaName := "," + normalizedCityName

	// Prepare filter string and parameters
	filter := "(unaccented_name = {:name} || " +
		"alternative_names = {:name} || " +
		"alternative_names ~ {:name_comma} || " +
		"alternative_names ~ {:comma_name_comma} || " +
		"alternative_names ~ {:comma_name})"

	params := dbx.Params{
		"name":             normalizedCityName,
		"name_comma":       nameComma,
		"comma_name_comma": commaNameComma,
		"comma_name":       commaName,
	}

	// Add country filter if hint is provided
	if countryISO2Hint != "" {
		filter += " && country.iso2 = {:country_iso2}"
		params["country_iso2"] = strings.ToUpper(countryISO2Hint) // Ensure ISO2 is uppercase
	}

	record, err := pb.FindRecordsByFilter(
		"city",
		filter,
		"-population",
		1,
		0,
		params,
		// Expansion is handled implicitly by the filter on country.iso2
	)

	if err != nil {
		if err == sql.ErrNoRows {
			pb.Logger().Warn("City not found in DB", "city_name", cityName, "country_hint", countryISO2Hint)
			return nil, ErrCityNotFound // Return specific error
		} else {
			pb.Logger().Error("Failed to query city", "city_name", cityName, "country_hint", countryISO2Hint, "error", err)
			return nil, err // Return the database error
		}
	}

	if len(record) == 0 {
		pb.Logger().Warn("City not found in DB", "city_name", cityName, "country_hint", countryISO2Hint)
		return nil, ErrCityNotFound // Return specific error
	}

	return record[0], nil // Return the found ID
}

const maxRetries = 1 // Allow 1 retry (total 2 attempts)

func (app *application) InitAIPlanner() error {
	app.pb.OnServe().BindFunc(func(e *core.ServeEvent) error {
		e.Router.POST("/api/planner/generate", func(c *core.RequestEvent) error {
			data := struct {
				Prompt string `json:"prompt"`
			}{}

			if err := c.BindBody(&data); err != nil {
				return apis.NewBadRequestError("Invalid request body", err)
			}

			apiKey := os.Getenv("GEMINI_API_KEY")
			if apiKey == "" {
				return apis.NewInternalServerError("GEMINI_API_KEY environment variable is not set", nil)
			}

			// Initialize Gemini client
			ctx := context.Background()
			client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
			if err != nil {
				app.pb.Logger().Error("Failed to initialize AI client", "error", err)
				return apis.NewInternalServerError("Failed to initialize AI client", err)
			}
			defer client.Close()

			// Create the model and prompt
			model := client.GenerativeModel(os.Getenv("GEMINI_MODEL"))
			var tripPlan TripPlan
			var lastErr error
			failedCities := make(map[string]string) // Store failed cities: name -> countryISO2

			for retry := 0; retry <= maxRetries; retry++ {
				// --- Construct Prompt ---
				prompt := `Generate a detailed travel plan based on the following request. 
				Format the response as a JSON object with the following structure:
				{
					"name": "Trip name",
					"description": "Trip description",
					"travel_items": [
						{
							"type": "plane/train/bus/car",
							"from": "Exact City name without accents in English",
							"from_country_iso2": "ISO 3166-1 alpha-2 country code",
							"to": "Exact City name without accents in English",
							"to_country_iso2": "ISO 3166-1 alpha-2 country code",
							"start_day": number,
							"arrival_day": number,
							"order": number
						}
					],
					"days": [
						{
							"day": number,
							"description": "Day description"
						}
					]
				}
				
				User request: ` + data.Prompt

				if retry > 0 && len(failedCities) > 0 {
					avoidList := ""
					for name, iso := range failedCities {
						if avoidList != "" {
							avoidList += ", "
						}
						avoidList += name + " (" + iso + ")"
					}
					prompt += "\n\nIMPORTANT: Please generate a new plan that specifically AVOIDS the following locations as they could not be processed: [" + avoidList + "]"
					app.pb.Logger().Info("Retrying AI generation, avoiding cities", "retry_attempt", retry, "avoid_list", avoidList)
				}
				// --- End Construct Prompt ---

				// Generate response
				resp, err := model.GenerateContent(ctx, genai.Text(prompt))
				if err != nil {
					app.pb.Logger().Error("Failed to generate plan test", "error", err, "retry_attempt", retry)
					lastErr = apis.NewInternalServerError("Failed to generate plan: "+err.Error(), err)
					continue // Try next retry if available
				}

				// Extract the text content from the response
				var responseText string
				if len(resp.Candidates) > 0 && resp.Candidates[0].Content != nil && len(resp.Candidates[0].Content.Parts) > 0 {
					if textPart, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
						responseText = string(textPart)
						// Clean the response text: remove backticks and "json" marker if present
						responseText = strings.TrimPrefix(responseText, "```json")
						responseText = strings.TrimSuffix(responseText, "```")
					} else {
						app.pb.Logger().Error("Response part is not text", "part", resp.Candidates[0].Content.Parts[0], "retry_attempt", retry)
						lastErr = apis.NewInternalServerError("Unexpected response format from AI", nil)
						continue // Try next retry if available
					}
				} else {
					app.pb.Logger().Error("Empty or invalid response structure from AI", "response", resp, "retry_attempt", retry)
					lastErr = apis.NewInternalServerError("Empty response from AI", nil)
					continue // Try next retry if available
				}

				// Parse the JSON response
				if err := json.Unmarshal([]byte(responseText), &tripPlan); err != nil {
					app.pb.Logger().Error("Failed to parse AI response JSON", "error", err, "response", responseText, "retry_attempt", retry)
					lastErr = apis.NewInternalServerError("Failed to parse AI response: "+err.Error(), err)
					continue // Try next retry if available
				}

				// --- Validate City IDs ---
				cityNotFoundInAttempt := false
				currentFailedCities := make(map[string]string) // Track failures for *this* attempt
				for i := range tripPlan.TravelItems {
					item := &tripPlan.TravelItems[i] // Use pointer to modify directly

					// Fetch FromId
					fromRecord, err := getCityRecordByName(app.pb, item.From, item.FromCountryISO2)
					if err != nil {
						if errors.Is(err, ErrCityNotFound) {
							app.pb.Logger().Warn("AI suggested 'from' city not found in DB", "city_name", item.From, "country_iso2", item.FromCountryISO2, "retry_attempt", retry)
							cityNotFoundInAttempt = true
							currentFailedCities[item.From] = item.FromCountryISO2
							// Continue checking other cities in this attempt
						} else {
							app.pb.Logger().Error("Database error looking up 'from' city", "error", err, "retry_attempt", retry)
							lastErr = apis.NewInternalServerError("Database error looking up 'from' city", err)
							goto EndRetryLoop // Fatal error, stop retrying
						}
					} else {
						item.FromRecord = fromRecord // Assign only if found
					}

					// Fetch ToId
					toRecord, err := getCityRecordByName(app.pb, item.To, item.ToCountryISO2)
					if err != nil {
						if errors.Is(err, ErrCityNotFound) {
							app.pb.Logger().Warn("AI suggested 'to' city not found in DB", "city_name", item.To, "country_iso2", item.ToCountryISO2, "retry_attempt", retry)
							cityNotFoundInAttempt = true
							currentFailedCities[item.To] = item.ToCountryISO2
							// Continue checking other cities in this attempt
						} else {
							app.pb.Logger().Error("Database error looking up 'to' city", "error", err, "retry_attempt", retry)
							lastErr = apis.NewInternalServerError("Database error looking up 'to' city", err)
							goto EndRetryLoop // Fatal error, stop retrying
						}
					} else {
						item.ToRecord = toRecord // Assign only if found
					}
				}
				// --- End Validate City IDs ---

				if !cityNotFoundInAttempt {
					// Success! All cities found in this attempt.
					return c.JSON(http.StatusOK, tripPlan)
				}

				// City not found in this attempt, prepare for next retry (if available)
				failedCities = currentFailedCities                                                    // Update the list of cities to avoid for the next try
				lastErr = apis.NewBadRequestError("Could not find one or more suggested cities", nil) // Store potential final error

			} // End of retry loop

		EndRetryLoop: // Label for goto
			// If loop finishes, it means max retries reached or a fatal error occurred
			if lastErr == nil {
				// Should ideally not happen if loop finishes, but safety net
				lastErr = apis.NewInternalServerError("An unexpected error occurred during plan generation", nil)
			}

			// Append failed cities to the error message if it was the BadRequestError from missing cities
			const cityNotFoundErrMsg = "Could not find one or more suggested cities"
			if lastErr != nil && lastErr.Error() == cityNotFoundErrMsg && len(failedCities) > 0 {
				failMsg := "Could not find cities after retrying: "
				first := true
				for name, iso := range failedCities {
					if !first {
						failMsg += ", "
					}
					failMsg += name + " (" + iso + ")"
					first = false
				}
				// Return a new error with the more specific message
				return apis.NewBadRequestError(failMsg, nil)
			}

			return lastErr // Return the last recorded error (could be InternalServerError or the original BadRequestError)

		}).Bind(apis.RequireAuth())

		return e.Next()
	})

	return nil
}
