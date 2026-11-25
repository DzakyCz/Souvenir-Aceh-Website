package handlers

import (
	"gorm.io/gorm"

	"souveniraceh-api/internal/config"
)

// Handlers holds the shared dependencies every HTTP handler needs.
type Handlers struct {
	DB  *gorm.DB
	Cfg config.Config
}

func New(db *gorm.DB, cfg config.Config) *Handlers {
	return &Handlers{DB: db, Cfg: cfg}
}
