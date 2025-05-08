package viator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// ViatorAPIBaseURL is the base URL for the Viator API.
const ViatorAPIBaseURL = "https://api.viator.com/partner" // Assuming this is the base, endpoint path will be added
const ViatorAPIVersion = "2.0"

// --- Request Structs ---
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

type ProductSearchResponse struct {
	Products   []Product `json:"products"`
	TotalCount int       `json:"totalCount"`
	// We can add other general API response fields if needed, e.g.:
	// Success          bool   `json:"success,omitempty"`
	// ErrorMessage     string `json:"errorMessage,omitempty"`
}

type Product struct {
	ProductCode string          `json:"productCode"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Reviews     ReviewSummary   `json:"reviews"`
	Duration    ProductDuration `json:"duration"`
	Pricing     ProductPricing  `json:"pricing"`
	ProductURL  string          `json:"productUrl"`
}

type ReviewSummary struct {
	TotalReviews          int     `json:"totalReviews"`
	CombinedAverageRating float64 `json:"combinedAverageRating"`
}

type ProductDuration struct {
	FixedDurationInMinutes int `json:"fixedDurationInMinutes,omitempty"`
	// VariableDuration could be added here if needed
}

type ProductPricing struct {
	Summary  ProductPriceSummary `json:"summary"`
	Currency string              `json:"currency"`
}

type ProductPriceSummary struct {
	FromPrice float64 `json:"fromPrice"`
}

// GetProductsByDestination fetches products for a specific destination ID from the Viator API.
func GetProductsByDestination(viatorDestinationID string, currency string, count int) (*ProductSearchResponse, error) {
	apiKey := os.Getenv("VIATOR_API_KEY")
	if apiKey == "" {
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
		return nil, fmt.Errorf("error marshalling request payload: %w", err)
	}

	url := fmt.Sprintf("%s/products/search", ViatorAPIBaseURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept-Language", "en-US")
	req.Header.Set("Accept", fmt.Sprintf("application/json;version=%s", ViatorAPIVersion))
	req.Header.Set("exp-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request to Viator API: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("viator API request failed with status %s: %s", resp.Status, string(body))
	}

	var searchResponse ProductSearchResponse
	if err := json.Unmarshal(body, &searchResponse); err != nil {
		return nil, fmt.Errorf("error unmarshalling response JSON: %w. Response body: %s", err, string(body))
	}

	return &searchResponse, nil
}

// InitActivityEndpoints sets up the API endpoints for fetching activities.
func InitActivityEndpoints(pb *pocketbase.PocketBase) {
	pb.OnServe().BindFunc(func(e *core.ServeEvent) error {
		// Endpoint to get activities by PocketBase City ID
		e.Router.GET("/api/viator/activities/pb_city/:id", func(c *core.RequestEvent) error {
			pbCityID := c.Request.PathValue("id")
			if pbCityID == "" {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing PocketBase city ID"})
			}

			cityRecord, err := pb.FindRecordById("city", pbCityID)
			if err != nil {
				log.Printf("Error finding city record by ID %s: %v", pbCityID, err)
				return c.JSON(http.StatusNotFound, map[string]string{"error": "City not found in PocketBase"})
			}

			viatorID := cityRecord.GetString("viatorId") // Assuming the field is named 'viatorId'
			if viatorID == "" {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "Viator ID not found for this city"})
			}

			// Get currency and count from query parameters
			currency := c.Request.URL.Query().Get("currency")
			if currency == "" {
				currency = "USD" // Default currency
			}

			countStr := c.Request.URL.Query().Get("count")
			count := 5 // Default count
			if countStr != "" {
				parsedCount, err := strconv.Atoi(countStr)
				if err == nil && parsedCount > 0 {
					count = parsedCount
				} else {
					return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid count parameter"})
				}
			}

			productsResponse, err := GetProductsByDestination(viatorID, currency, count)
			if err != nil {
				log.Printf("Error from GetProductsByDestination for ViatorID %s: %v", viatorID, err)
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch products from Viator", "details": err.Error()})
			}

			return c.JSON(http.StatusOK, productsResponse)
		})

		// Endpoint to get activities by direct Viator City ID
		e.Router.GET("/api/viator/activities/viator_city/:id", func(c *core.RequestEvent) error {
			viatorCityID := c.Request.PathValue("id")
			if viatorCityID == "" {
				return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing Viator city ID"})
			}

			// Get currency and count from query parameters
			currency := c.Request.URL.Query().Get("currency")
			if currency == "" {
				currency = "USD" // Default currency
			}

			countStr := c.Request.URL.Query().Get("count")
			count := 5 // Default count
			if countStr != "" {
				parsedCount, err := strconv.Atoi(countStr)
				if err == nil && parsedCount > 0 {
					count = parsedCount
				} else {
					return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid count parameter"})
				}
			}

			productsResponse, err := GetProductsByDestination(viatorCityID, currency, count)
			if err != nil {
				log.Printf("Error from GetProductsByDestination for ViatorID %s: %v", viatorCityID, err)
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch products from Viator", "details": err.Error()})
			}

			return c.JSON(http.StatusOK, productsResponse)
		})

		return e.Next()
	})
}
