package models

import "time"

type Category struct {
	ID      uint    `gorm:"primaryKey" json:"id"`
	Slug    string  `gorm:"size:80;uniqueIndex" json:"slug"`
	Name    string  `gorm:"size:120" json:"name"`
	Short   string  `gorm:"size:60" json:"short"`
	Caption string  `gorm:"size:160" json:"caption"`
	Icon    *string `gorm:"size:160" json:"icon"`
}

type Shop struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Slug        string `gorm:"size:80;uniqueIndex" json:"slug"`
	Name        string `gorm:"size:120" json:"name"`
	Origin      string `gorm:"size:120" json:"origin"`
	Description string `gorm:"type:text" json:"description"`
}

type Product struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Slug          string    `gorm:"size:140;uniqueIndex" json:"slug"`
	Name          string    `gorm:"size:160" json:"name"`
	CategoryID    uint      `json:"categoryId"`
	Category      Category  `json:"category"`
	ShopID        uint      `json:"shopId"`
	Shop          Shop      `json:"shop"`
	Price         int       `json:"price"`
	Size          string    `gorm:"size:60" json:"size"`
	ShelfLifeDays int       `json:"shelfLifeDays"`
	Stock         int       `json:"stock"`
	ImageURL      *string   `gorm:"size:400" json:"imageUrl"`
	Description   string    `gorm:"type:text" json:"description"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

const (
	OrderStatusCreated    = "created"
	OrderStatusProcessing = "processing"
	OrderStatusReady      = "ready"
	OrderStatusCompleted  = "completed"
	OrderStatusCancelled  = "cancelled"
)

var ValidOrderStatuses = map[string]bool{
	OrderStatusCreated:    true,
	OrderStatusProcessing: true,
	OrderStatusReady:      true,
	OrderStatusCompleted:  true,
	OrderStatusCancelled:  true,
}

type Order struct {
	ID           string      `gorm:"primaryKey;size:20" json:"id"`
	CustomerName string      `gorm:"size:120" json:"customerName"`
	Phone        string      `gorm:"size:20" json:"phone"`
	Method       string      `gorm:"size:20" json:"method"`
	Location     string      `gorm:"size:200" json:"location"`
	DeliveryDate string      `gorm:"size:10" json:"deliveryDate"`
	Fee          int         `json:"fee"`
	Subtotal     int         `json:"subtotal"`
	Total        int         `json:"total"`
	Status       string      `gorm:"size:20;default:created" json:"status"`
	PlacedAt     time.Time   `json:"placedAt"`
	Items        []OrderItem `json:"items"`
}

type OrderItem struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	OrderID       string `gorm:"size:20;index" json:"orderId"`
	ProductID     uint   `json:"productId"`
	NameSnapshot  string `gorm:"size:160" json:"name"`
	Qty           int    `json:"qty"`
	PriceSnapshot int    `json:"price"`
}

type Admin struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"size:80;uniqueIndex" json:"username"`
	PasswordHash string    `gorm:"size:200" json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
}
