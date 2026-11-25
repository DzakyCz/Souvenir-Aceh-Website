package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	"souveniraceh-api/internal/models"
)

func (h *Handlers) AdminListOrders(w http.ResponseWriter, r *http.Request) {
	query := h.DB.Preload("Items").Order("placed_at desc")
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	var orders []models.Order
	if err := query.Find(&orders).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat pesanan")
		return
	}
	writeJSON(w, http.StatusOK, orders)
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

func (h *Handlers) AdminUpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload tidak valid")
		return
	}
	if !models.ValidOrderStatuses[req.Status] {
		writeError(w, http.StatusBadRequest, "status tidak valid")
		return
	}

	var order models.Order
	if err := h.DB.Where("id = ?", id).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "pesanan tidak ditemukan")
			return
		}
		writeError(w, http.StatusInternalServerError, "gagal memuat pesanan")
		return
	}

	if err := h.DB.Model(&order).Update("status", req.Status).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memperbarui status")
		return
	}
	h.DB.Preload("Items").Where("id = ?", id).First(&order)
	writeJSON(w, http.StatusOK, order)
}
