package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL   string
	JWTSecret     string
	Port          string
	CORSOrigins   []string
	AdminUsername string
	AdminPassword string
}

func Load() Config {
	_ = godotenv.Load()
	return Config{
		DatabaseURL:   getenv("DATABASE_URL", "postgres://souvenir:souvenir@localhost:5432/souveniraceh?sslmode=disable"),
		JWTSecret:     getenv("JWT_SECRET", "dev-secret-change-me"),
		Port:          getenv("PORT", "8080"),
		CORSOrigins:   splitList(getenv("CORS_ORIGIN", "http://localhost:3000,http://127.0.0.1:3000")),
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

// splitList turns a comma-separated env value into a trimmed list, so
// CORS_ORIGIN can name more than one origin.
func splitList(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
