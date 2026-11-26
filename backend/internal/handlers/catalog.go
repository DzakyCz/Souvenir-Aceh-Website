package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	"souveniraceh-api/internal/models"
)

func (h *Handlers) Categories(w http.ResponseWriter, r *http.Request) {
	var categories []models.Category
	if err := h.DB.Order("id").Find(&categories).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat kategori")
		return
	}
	writeJSON(w, http.StatusOK, categories)
}

func (h *Handlers) Shops(w http.ResponseWriter, r *http.Request) {
	var shops []models.Shop
	if err := h.DB.Order("id").Find(&shops).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat toko")
		return
	}
	writeJSON(w, http.StatusOK, shops)
}

func (h *Handlers) Products(w http.ResponseWriter, r *http.Request) {
	// Joins pulls Category and Shop in the same statement; Preload would issue
	// one extra query each, and every round trip to the pooler costs ~230ms.
	query := h.DB.Model(&models.Product{}).Joins("Category").Joins("Shop")

	if categorySlug := r.URL.Query().Get("category"); categorySlug != "" {
		query = query.Where(`"Category".slug = ?`, categorySlug)
	}
	if search := strings.TrimSpace(r.URL.Query().Get("q")); search != "" {
		query = query.Where("LOWER(products.name) LIKE ?", "%"+strings.ToLower(search)+"%")
	}
	switch r.URL.Query().Get("sort") {
	case "harga_asc":
		query = query.Order("products.price asc")
	case "harga_desc":
		query = query.Order("products.price desc")
	default:
		query = query.Order("products.created_at desc")
	}

	var products []models.Product
	if err := query.Find(&products).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat produk")
		return
	}
	writeJSON(w, http.StatusOK, products)
}

func (h *Handlers) ProductBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var product models.Product
	err := h.DB.Joins("Category").Joins("Shop").Where("products.slug = ?", slug).First(&product).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		writeError(w, http.StatusNotFound, "produk tidak ditemukan")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat produk")
		return
	}
	writeJSON(w, http.StatusOK, product)
}
