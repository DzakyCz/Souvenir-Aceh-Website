package handlers

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"souveniraceh-api/internal/middleware"
	"souveniraceh-api/internal/models"
)

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handlers) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload tidak valid")
		return
	}

	var admin models.Admin
	if err := h.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		writeError(w, http.StatusUnauthorized, "username atau password salah")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "username atau password salah")
		return
	}

	token, err := middleware.GenerateToken(h.Cfg.JWTSecret, admin.ID, admin.Username)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "gagal membuat token")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}
