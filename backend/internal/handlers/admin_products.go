package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	"souveniraceh-api/internal/models"
)

func (h *Handlers) AdminListProducts(w http.ResponseWriter, r *http.Request) {
	var products []models.Product
	if err := h.DB.Preload("Category").Preload("Shop").Order("id").Find(&products).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat produk")
		return
	}
	writeJSON(w, http.StatusOK, products)
}

type productRequest struct {
	Slug          string `json:"slug"`
	Name          string `json:"name"`
	CategoryID    uint   `json:"categoryId"`
	ShopID        uint   `json:"shopId"`
	Price         int    `json:"price"`
	Size          string `json:"size"`
	ShelfLifeDays int    `json:"shelfLifeDays"`
	Stock         int    `json:"stock"`
	ImageURL      string `json:"imageUrl"`
	Description   string `json:"description"`
}

// slugify turns a product name into a URL-safe slug, used as a fallback when
// the admin form leaves the slug field blank.
func slugify(name string) string {
	var b strings.Builder
	prevDash := false
	for _, r := range strings.ToLower(strings.TrimSpace(name)) {
		switch {
		case r >= 'a' && r <= 'z' || r >= '0' && r <= '9':
			b.WriteRune(r)
			prevDash = false
		default:
			if !prevDash && b.Len() > 0 {
				b.WriteByte('-')
				prevDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}

func (h *Handlers) validateProductRequest(w http.ResponseWriter, req *productRequest) (string, *string, bool) {
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "nama produk wajib diisi")
		return "", nil, false
	}
	if req.CategoryID == 0 || req.ShopID == 0 {
		writeError(w, http.StatusBadRequest, "kategori dan toko wajib dipilih")
		return "", nil, false
	}
	if req.Price < 0 || req.Stock < 0 {
		writeError(w, http.StatusBadRequest, "harga dan stok tidak boleh negatif")
		return "", nil, false
	}
	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		slug = slugify(req.Name)
	}
	if slug == "" {
		writeError(w, http.StatusBadRequest, "slug tidak valid")
		return "", nil, false
	}
	var imagePtr *string
	if img := strings.TrimSpace(req.ImageURL); img != "" {
		imagePtr = &img
	}
	return slug, imagePtr, true
}

func (h *Handlers) AdminCreateProduct(w http.ResponseWriter, r *http.Request) {
	var req productRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	slug, imagePtr, ok := h.validateProductRequest(w, &req)
	if !ok {
		return
	}

	product := models.Product{
		Slug:          slug,
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		ShopID:        req.ShopID,
		Price:         req.Price,
		Size:          req.Size,
		ShelfLifeDays: req.ShelfLifeDays,
		Stock:         req.Stock,
		ImageURL:      imagePtr,
		Description:   req.Description,
	}
	if err := h.DB.Create(&product).Error; err != nil {
		writeError(w, http.StatusBadRequest, "gagal menyimpan produk, slug mungkin sudah dipakai")
		return
	}
	h.DB.Preload("Category").Preload("Shop").First(&product, product.ID)
	writeJSON(w, http.StatusCreated, product)
}

func (h *Handlers) AdminUpdateProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "id tidak valid")
		return
	}
	var product models.Product
	if err := h.DB.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "produk tidak ditemukan")
			return
		}
		writeError(w, http.StatusInternalServerError, "gagal memuat produk")
		return
	}

	var req productRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	slug, imagePtr, ok := h.validateProductRequest(w, &req)
	if !ok {
		return
	}

	product.Slug = slug
	product.Name = req.Name
	product.CategoryID = req.CategoryID
	product.ShopID = req.ShopID
	product.Price = req.Price
	product.Size = req.Size
	product.ShelfLifeDays = req.ShelfLifeDays
	product.Stock = req.Stock
	product.ImageURL = imagePtr
	product.Description = req.Description

	if err := h.DB.Save(&product).Error; err != nil {
		writeError(w, http.StatusBadRequest, "gagal menyimpan produk, slug mungkin sudah dipakai")
		return
	}
	h.DB.Preload("Category").Preload("Shop").First(&product, product.ID)
	writeJSON(w, http.StatusOK, product)
}

func (h *Handlers) AdminDeleteProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "id tidak valid")
		return
	}
	if err := h.DB.Delete(&models.Product{}, id).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal menghapus produk")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
