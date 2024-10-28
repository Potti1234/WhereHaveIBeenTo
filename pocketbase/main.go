package main

import (
    "log"
    "net/http"

    "github.com/labstack/echo/v5"
    "github.com/pocketbase/pocketbase"
    "github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/apis"
)

func main() {
    app := pocketbase.New()

    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/hello/:name", func(c echo.Context) error {
			name := c.PathParam("name")
	
			return c.JSON(http.StatusOK, map[string]string{"message": "Hello " + name})
		}, apis.RequireAdminOrRecordAuth())
	
		return nil
	})

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}