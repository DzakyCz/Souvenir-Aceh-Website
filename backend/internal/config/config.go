package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL   string
	JWTSecret     string
	Port          string
	CORSOrigin    string
	AdminUsername string
	AdminPassword string
}

func Load() Config {
	_ = godotenv.Load()
	return Config{
		DatabaseURL:   getenv("DATABASE_URL", "postgres://souvenir:souvenir@localhost:5432/souveniraceh?sslmode=disable"),
		JWTSecret:     getenv("JWT_SECRET", "dev-secret-change-me"),
		Port:          getenv("PORT", "8080"),
		CORSOrigin:    getenv("CORS_ORIGIN", "http://localhost:3000"),
		AdminUsername: getenv("ADMIN_USERNAME", "admin"),
		AdminPassword: getenv("ADMIN_PASSWORD", "admin12345"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
