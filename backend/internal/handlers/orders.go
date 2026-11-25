package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"souveniraceh-api/internal/models"
)

const hotelFee = 15000

type orderItemRequest struct {
	Slug string `json:"slug"`
	Qty  int    `json:"qty"`
}

type createOrderRequest struct {
	Name         string             `json:"name"`
	Phone        string             `json:"phone"`
	Method       string             `json:"method"`
	Location     string             `json:"location"`
	DeliveryDate string             `json:"deliveryDate"`
	Items        []orderItemRequest `json:"items"`
}

func generateOrderID() (string, error) {
	raw := make([]byte, 4)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return "SA" + strings.ToUpper(hex.EncodeToString(raw)), nil
}

func (h *Handlers) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req createOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload tidak valid")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Location = strings.TrimSpace(req.Location)
	if req.Name == "" || req.Phone == "" || req.Location == "" || req.DeliveryDate == "" {
		writeError(w, http.StatusBadRequest, "nama, telepon, lokasi, dan tanggal serah wajib diisi")
		return
	}
	if req.Method != "pickup" && req.Method != "hotel" {
		writeError(w, http.StatusBadRequest, "method harus pickup atau hotel")
		return
	}
	if len(req.Items) == 0 {
		writeError(w, http.StatusBadRequest, "keranjang tidak boleh kosong")
		return
	}

	fee := 0
	if req.Method == "hotel" {
		fee = hotelFee
	}

	orderID, err := generateOrderID()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "gagal membuat id pesanan")
		return
	}

	var order models.Order
	txErr := h.DB.Transaction(func(tx *gorm.DB) error {
		subtotal := 0
		items := make([]models.OrderItem, 0, len(req.Items))
		for _, line := range req.Items {
			if line.Qty <= 0 {
				return fmt.Errorf("jumlah untuk %s tidak valid", line.Slug)
			}
			var product models.Product
			// Lock the row so two checkouts can't both oversell the last unit.
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
				Where("slug = ?", line.Slug).First(&product).Error; err != nil {
				return fmt.Errorf("produk %s tidak ditemukan", line.Slug)
			}
			if product.Stock < line.Qty {
				return fmt.Errorf("stok %s tidak cukup", product.Name)
			}
			product.Stock -= line.Qty
			if err := tx.Model(&product).Update("stock", product.Stock).Error; err != nil {
				return err
			}
			subtotal += product.Price * line.Qty
			items = append(items, models.OrderItem{
				ProductID:     product.ID,
				NameSnapshot:  product.Name,
				Qty:           line.Qty,
				PriceSnapshot: product.Price,
			})
		}

		order = models.Order{
			ID:           orderID,
			CustomerName: req.Name,
			Phone:        req.Phone,
			Method:       req.Method,
			Location:     req.Location,
			DeliveryDate: req.DeliveryDate,
			Fee:          fee,
			Subtotal:     subtotal,
			Total:        subtotal + fee,
			Status:       models.OrderStatusCreated,
			PlacedAt:     time.Now(),
			Items:        items,
		}
		return tx.Create(&order).Error
	})
	if txErr != nil {
		writeError(w, http.StatusBadRequest, txErr.Error())
		return
	}

	writeJSON(w, http.StatusCreated, order)
}

func (h *Handlers) GetOrder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var order models.Order
	err := h.DB.Preload("Items").Where("id = ?", id).First(&order).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		writeError(w, http.StatusNotFound, "pesanan tidak ditemukan")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "gagal memuat pesanan")
		return
	}
	writeJSON(w, http.StatusOK, order)
}
