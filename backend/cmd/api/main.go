package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"souveniraceh-api/internal/config"
	"souveniraceh-api/internal/db"
	"souveniraceh-api/internal/handlers"
	"souveniraceh-api/internal/middleware"
)

func main() {
	cfg := config.Load()

	gormDB, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("gagal konek database: %v", err)
	}
	if err := db.Migrate(gormDB); err != nil {
		log.Fatalf("gagal migrasi skema: %v", err)
	}
	if err := db.Seed(gormDB, cfg); err != nil {
		log.Fatalf("gagal seed data: %v", err)
	}

	h := handlers.New(gormDB, cfg)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: cfg.CORSOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}))

	r.Route("/api", func(r chi.Router) {
		r.Get("/categories", h.Categories)
		r.Get("/shops", h.Shops)
		r.Get("/products", h.Products)
		r.Get("/products/{slug}", h.ProductBySlug)
		r.Post("/orders", h.CreateOrder)
		r.Get("/orders/{id}", h.GetOrder)

		r.Post("/admin/login", h.AdminLogin)

		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAdmin(cfg.JWTSecret))
			r.Get("/admin/products", h.AdminListProducts)
			r.Post("/admin/products", h.AdminCreateProduct)
			r.Put("/admin/products/{id}", h.AdminUpdateProduct)
			r.Delete("/admin/products/{id}", h.AdminDeleteProduct)
			r.Get("/admin/orders", h.AdminListOrders)
			r.Patch("/admin/orders/{id}/status", h.AdminUpdateOrderStatus)
		})
	})

	log.Printf("souveniraceh-api listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}
}
