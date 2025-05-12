package viator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// ViatorAPIBaseURL is the base URL for the Viator API.
const ViatorAPIBaseURL = "https://api.viator.com/partner" // Assuming this is the base, endpoint path will be added
const ViatorAPIVersion = "2.0"

// --- Request Structs ---
// ... (existing structs) ...

type ProductSearchPayload struct {
	Filtering  FilteringOptions  `json:"filtering"`
	Pagination PaginationOptions `json:"pagination"`
	Sorting    SortingOptions    `json:"sorting"`
	Currency   string            `json:"currency"`
}

type FilteringOptions struct {
	Destination string `json:"destination"`
}

type PaginationOptions struct {
	Start int `json:"start"`
	Count int `json:"count"`
}

type SortingOptions struct {
	Sort  string `json:"sort"`
	Order string `json:"order"`
}

// --- Response Structs ---
type ActivityResponse struct {
	Products   []*core.Record `json:"products"`
	TotalCount int            `json:"totalCount"`
}

// GetProductsByDestination fetches products for a specific destination ID from the Viator API.
func GetProductsByDestination(pb *pocketbase.PocketBase, viatorDestinationID string, currency string, count int, cityId string) (*ActivityResponse, error) {
	// First check if we have recent cached activities
	oneWeekAgo := time.Now().AddDate(0, 0, -7)

	cachedRecords, err := pb.FindRecordsByFilter("activity",
		fmt.Sprintf("city = '%s' && updated > '%s'", cityId, oneWeekAgo.Format(time.RFC3339)),
		"-updated",
		count,
		0,
	)

	if err != nil {
		pb.Logger().Warn("Error querying activity cache", "cityId", cityId, "error", err)
		return nil, fmt.Errorf("error querying activity cache: %w", err)
	} else if len(cachedRecords) > 0 {
		return &ActivityResponse{
			Products:   cachedRecords,
			TotalCount: len(cachedRecords),
		}, nil
	}

	apiKey := os.Getenv("VIATOR_API_KEY")
	if apiKey == "" {
		pb.Logger().Error("VIATOR_API_KEY environment variable not set")
		return nil, fmt.Errorf("VIATOR_API_KEY environment variable not set")
	}

	payload := ProductSearchPayload{
		Filtering: FilteringOptions{
			Destination: viatorDestinationID,
		},
		Pagination: PaginationOptions{
			Start: 1,
			Count: count,
		},
		Sorting: SortingOptions{
			Sort:  "TRAVELER_RATING",
			Order: "DESCENDING",
		},
		Currency: currency,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		pb.Logger().Error("Error marshalling Viator request payload", "error", err)
		return nil, fmt.Errorf("error marshalling request payload: %w", err)
	}

	url := fmt.Sprintf("%s/products/search", ViatorAPIBaseURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		pb.Logger().Error("Error creating Viator API request object", "error", err)
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept-Language", "en-US")
	req.Header.Set("Accept", fmt.Sprintf("application/json;version=%s", ViatorAPIVersion))
	req.Header.Set("exp-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		pb.Logger().Error("Error making request to Viator API", "url", url, "error", err)
		return nil, fmt.Errorf("error making request to Viator API: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		pb.Logger().Error("Error reading Viator API response body", "url", url, "status", resp.Status, "error", err)
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		pb.Logger().Error("Viator API request failed", "url", url, "status", resp.Status, "body", string(body))
		return nil, fmt.Errorf("viator API request failed with status %s: %s", resp.Status, string(body))
	}

	var rawResponse struct {
		Products []struct {
			ProductCode string `json:"productCode"`
			Title       string `json:"title"`
			Description string `json:"description"`
			Reviews     struct {
				TotalReviews          int     `json:"totalReviews"`
				CombinedAverageRating float64 `json:"combinedAverageRating"`
			} `json:"reviews"`
			Duration struct {
				FixedDurationInMinutes int `json:"fixedDurationInMinutes,omitempty"`
			} `json:"duration"`
			Pricing struct {
				Summary struct {
					FromPrice float64 `json:"fromPrice"`
				} `json:"summary"`
			} `json:"pricing"`
			ProductURL string `json:"productUrl"`
		} `json:"products"`
		TotalCount int `json:"totalCount"`
	}

	if err := json.Unmarshal(body, &rawResponse); err != nil {
		// Log only an excerpt of the body to avoid excessively large logs
		bodyExcerpt := string(body)
		if len(bodyExcerpt) > 500 {
			bodyExcerpt = bodyExcerpt[:500] + "..."
		}
		pb.Logger().Error("Error unmarshalling Viator response JSON", "error", err, "responseBodyExcerpt", bodyExcerpt)
		return nil, fmt.Errorf("error unmarshalling response JSON: %w. Response body: %s", err, string(body))
	}

	activityCollection, err := pb.FindCollectionByNameOrId("activity")
	if err != nil {
		pb.Logger().Error("Error getting activity collection from PocketBase", "error", err)
		return nil, fmt.Errorf("error getting activity collection: %w", err)
	}

	var activityRecords []*core.Record
	for _, product := range rawResponse.Products {
		record := core.NewRecord(activityCollection)
		record.Set("title", product.Title)
		record.Set("description", product.Description)
		record.Set("review_amount", product.Reviews.TotalReviews)
		record.Set("review_stars", product.Reviews.CombinedAverageRating)
		record.Set("duration", product.Duration.FixedDurationInMinutes)
		record.Set("price", product.Pricing.Summary.FromPrice)
		record.Set("url", product.ProductURL)
		record.Set("city", cityId)

		if err := pb.Save(record); err != nil {
			pb.Logger().Error("Error saving activity to cache", "productCode", product.ProductCode, "error", err)
			continue
		}
		activityRecords = append(activityRecords, record)
	}

	return &ActivityResponse{
		Products:   activityRecords,
		TotalCount: len(activityRecords),
	}, nil
}

// InitActivityEndpoints sets up the API endpoints for fetching activities.
func InitActivityEndpoints(pb *pocketbase.PocketBase) {
	if pb == nil {
		fmt.Println("CRITICAL_ERROR: InitActivityEndpoints called with nil pb instance")
		return
	}

	pb.OnServe().BindFunc(func(e *core.ServeEvent) error {
		// Endpoint to get activities by PocketBase City ID
		e.Router.GET("/api/viator/activities/pb_city/{id}", func(c *core.RequestEvent) error {
			pbCityID := c.Request.PathValue("id")
			if pbCityID == "" {
				pb.Logger().Warn("Missing PocketBase city ID in request path")
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing PocketBase city ID"})
			}

			cityRecord, err := pb.FindRecordById("city", pbCityID)
			if err != nil {
				pb.Logger().Warn("Error finding city record by PocketBase ID", "pbCityID", pbCityID, "error", err)
				return c.JSON(http.StatusNotFound, map[string]string{"error": "City not found in PocketBase"})
			}

			viatorID := cityRecord.GetString("viatorId")
			if viatorID == "" {
				pb.Logger().Warn("Viator ID not found for city in PocketBase record", "pbCityID", pbCityID, "cityRecordId", cityRecord.Id)
				return c.JSON(http.StatusNotFound, map[string]string{"error": "Viator ID not found for this city"})
			}

			currency := c.Request.URL.Query().Get("currency")
			if currency == "" {
				currency = "USD"
			}
			countStr := c.Request.URL.Query().Get("count")
			count := 5 // Default count
			if countStr != "" {
				parsedCount, err := strconv.Atoi(countStr)
				if err == nil && parsedCount > 0 {
					count = parsedCount
				} else {
					pb.Logger().Warn("Invalid count parameter in query", "countStr", countStr, "error", err)
					return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid count parameter"})
				}
			}

			activitiesResponse, err := GetProductsByDestination(pb, viatorID, currency, count, pbCityID)
			if err != nil {
				pb.Logger().Error("Error from GetProductsByDestination (PB City ID handler)", "viatorID", viatorID, "pbCityID", pbCityID, "error", err.Error())
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch activities from Viator", "details": err.Error()})
			}

			return c.JSON(http.StatusOK, activitiesResponse)
		})

		// Endpoint to get activities by direct Viator City ID
		e.Router.GET("/api/viator/activities/viator_city/{id}", func(c *core.RequestEvent) error {
			viatorCityID := c.Request.PathValue("id")
			if viatorCityID == "" {
				pb.Logger().Warn("Missing Viator city ID in request path")
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing Viator city ID"})
			}

			cityRecord, err := pb.FindFirstRecordByData("city", "viatorId", viatorCityID)
			if err != nil {
				pb.Logger().Warn("Error finding city record by Viator ID", "viatorCityID", viatorCityID, "error", err)
				return c.JSON(http.StatusNotFound, map[string]string{"error": "City not found in PocketBase"})
			}
			pbCityID := cityRecord.Id

			currency := c.Request.URL.Query().Get("currency")
			if currency == "" {
				currency = "USD"
			}
			countStr := c.Request.URL.Query().Get("count")
			count := 5 // Default count
			if countStr != "" {
				parsedCount, err := strconv.Atoi(countStr)
				if err == nil && parsedCount > 0 {
					count = parsedCount
				} else {
					pb.Logger().Warn("Invalid count parameter in query", "countStr", countStr, "error", err)
					return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid count parameter"})
				}
			}

			activitiesResponse, err := GetProductsByDestination(pb, viatorCityID, currency, count, pbCityID)
			if err != nil {
				pb.Logger().Error("Error from GetProductsByDestination (Viator City ID handler)", "viatorCityID", viatorCityID, "pbCityID", pbCityID, "error", err.Error())
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch activities from Viator", "details": err.Error()})
			}

			return c.JSON(http.StatusOK, activitiesResponse)
		})

		return e.Next()
	})
}
