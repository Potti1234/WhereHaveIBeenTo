package main

import (
	"context"
	"database/sql"
	"encoding/json"
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
	Type       string       `json:"type"`
	From       string       `json:"from"`
	FromRecord *core.Record `json:"from_record"`
	To         string       `json:"to"`
	ToRecord   *core.Record `json:"to_record"`
	StartDay   int          `json:"start_day"`
	ArrivalDay int          `json:"arrival_day"`
	Order      int          `json:"order"`
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

// Function to find city ID by normalized name
func getCityRecordByName(pb *pocketbase.PocketBase, cityName string) (*core.Record, error) {
	record, err := pb.FindFirstRecordByFilter(
		"city",
		"unaccented_name = {:name}",
		dbx.Params{"name": cityName},
	)

	if err != nil {
		if err == sql.ErrNoRows {
			pb.Logger().Warn("City not found in DB", "city_name", cityName)
			return nil, nil // Not found is not a blocking error, return empty ID
		} else {
			pb.Logger().Error("Failed to query city", "city_name", cityName, "error", err)
			return nil, err // Return the database error
		}
	}

	return record, nil // Return the found ID
}

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
			prompt := `Generate a detailed travel plan based on the following request. 
			Format the response as a JSON object with the following structure:
			{
				"name": "Trip name",
				"description": "Trip description",
				"travel_items": [
					{
						"type": "plane/train/bus/car",
						"from": "City name without accents in English",
						"to": "City name without accents in English",
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

			// Generate response
			resp, err := model.GenerateContent(ctx, genai.Text(prompt))
			if err != nil {
				app.pb.Logger().Error("Failed to generate plan test", "error", err)
				return apis.NewInternalServerError("Failed to generate plan"+err.Error(), err)
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
					app.pb.Logger().Error("Response part is not text", "part", resp.Candidates[0].Content.Parts[0])
					return apis.NewInternalServerError("Unexpected response format from AI", nil)
				}
			} else {
				app.pb.Logger().Error("Empty or invalid response structure from AI", "response", resp)
				return apis.NewInternalServerError("Empty response from AI", nil)
			}

			// Parse the JSON response
			var tripPlan TripPlan
			if err := json.Unmarshal([]byte(responseText), &tripPlan); err != nil {
				app.pb.Logger().Error("Failed to parse AI response JSON", "error", err, "response", responseText)
				return apis.NewInternalServerError("Failed to parse AI response: "+err.Error(), err)
			}

			// --- Fetch City IDs ---
			for i := range tripPlan.TravelItems {
				item := &tripPlan.TravelItems[i] // Use pointer to modify directly

				// Fetch FromId
				fromRecord, err := getCityRecordByName(app.pb, item.From)
				if err != nil {
					// Handle database error during 'from' city lookup
					return apis.NewInternalServerError("Database error looking up 'from' city", err)
				}
				item.FromRecord = fromRecord

				// Fetch ToId
				toRecord, err := getCityRecordByName(app.pb, item.To)
				if err != nil {
					// Handle database error during 'to' city lookup
					return apis.NewInternalServerError("Database error looking up 'to' city", err)
				}
				item.ToRecord = toRecord
			}
			// --- End Fetch City IDs ---

			return c.JSON(http.StatusOK, tripPlan)
		}).Bind(apis.RequireAuth())

		return e.Next()
	})

	return nil
}
