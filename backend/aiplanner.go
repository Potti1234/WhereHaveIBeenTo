package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"google.golang.org/api/option"
)

type TripPlanRequest struct {
	Prompt string `json:"prompt"`
}

type TravelItem struct {
	Type        string     `json:"type"`
	From        string     `json:"from"`
	To          string     `json:"to"`
	StartDate   *time.Time `json:"start_date"`
	ArrivalDate *time.Time `json:"arrival_date"`
	Order       int        `json:"order"`
}

type TripPlan struct {
	Name        string       `json:"name"`
	Description string       `json:"description"`
	TravelItems []TravelItem `json:"travel_items"`
}

func (app *application) InitAIPlanner() error {
	app.pb.OnServe().BindFunc(func(e *core.ServeEvent) error {
		e.Router.GET("/api/planner/generate", func(c *core.RequestEvent) error {
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
						"from": "City name",
						"to": "City name",
						"start_date": "ISO date string",
						"arrival_date": "ISO date string",
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

			// Parse the response

			return c.JSON(http.StatusOK, resp.Candidates[0].Content)
		}).Bind(apis.RequireAuth())

		return e.Next()
	})

	return nil
}
