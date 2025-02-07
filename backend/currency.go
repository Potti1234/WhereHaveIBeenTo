package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase/core"
)

type ExchangeRateResponse struct {
	Result          string             `json:"result"`
	BaseCode        string             `json:"base_code"`
	ConversionRates map[string]float64 `json:"conversion_rates"`
}

func getApiURL() string {
	err := godotenv.Load(".env")

	if err != nil {
		log.Println("Error loading .env file")
	}
	return fmt.Sprintf("https://v6.exchangerate-api.com/v6/%s/latest/USD", os.Getenv("EXCHANGE_RATE_API_KEY"))
}

func UpdateCurrencyRates(app core.App) error {
	resp, err := http.Get(getApiURL())
	if err != nil {
		return fmt.Errorf("failed to fetch exchange rates: %v", err)
	}

	defer resp.Body.Close()

	var rateResponse ExchangeRateResponse
	if err := json.NewDecoder(resp.Body).Decode(&rateResponse); err != nil {
		return fmt.Errorf("failed to decode response: %v", err)
	}

	collection, err := app.FindCollectionByNameOrId("currency")
	if err != nil {
		return fmt.Errorf("failed to find currencies collection: %v", err)
	}

	// Update or create currency records
	for code, rate := range rateResponse.ConversionRates {
		// Try to find existing record
		record, err := app.FindFirstRecordByData("currency", "code", code)

		if err != nil {
			// Create new record if not found
			log.Println("Creating new record for", code, rate)

			record = core.NewRecord(collection)
			record.Set("code", code)
			record.Set("rate", rate)
			record.Set("last_updated", time.Now())

			if err := app.Save(record); err != nil {
				return fmt.Errorf("failed to create currency %s: %v", code, err)
			}
		} else {
			// Update existing record
			record.Set("rate", rate)
			record.Set("last_updated", time.Now())

			if err := app.Save(record); err != nil {
				return fmt.Errorf("failed to update currency %s: %v", code, err)
			}

		}
	}

	return nil
}

// InitCurrencyUpdater starts the daily currency update cron job
func (app *application) InitCurrencyUpdater() {
	// Add the initialization to the OnBeforeServe hook
	app.pb.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Add daily cron job to update currencies
		app.pb.Cron().MustAdd("update_currencies", "0 0 * * *", func() {
			if err := UpdateCurrencyRates(app.pb); err != nil {
				fmt.Printf("Error updating currency rates: %v\n", err)
			}
		})

		// Run initial update
		if err := UpdateCurrencyRates(app.pb); err != nil {
			fmt.Printf("Error during initial currency rates update: %v\n", err)
		}

		return se.Next()
	})
}

func (app *application) InitCurrencyConversionEndpoint() {
	app.pb.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/currency/conversion/{from}/{to}", func(c *core.RequestEvent) error {
			from := c.Request.PathValue("from")
			to := c.Request.PathValue("to")

			if from == "" || to == "" {
				return c.String(http.StatusBadRequest, "Missing from or to path parameters")
			}

			fromRecord, err := app.pb.FindFirstRecordByData("currency", "code", from)
			if err != nil {
				return c.String(http.StatusNotFound, "Currency not found")
			}

			toRecord, err := app.pb.FindFirstRecordByData("currency", "code", to)
			if err != nil {
				return c.String(http.StatusNotFound, "Currency not found")
			}

			fromRate := fromRecord.Get("rate").(float64)
			toRate := toRecord.Get("rate").(float64)

			conversionRate := toRate / fromRate

			return c.JSON(http.StatusOK, map[string]any{"from": from, "to": to, "rate": conversionRate})
		})

		return se.Next()
	})
}
