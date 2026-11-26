package db

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"souveniraceh-api/internal/config"
	"souveniraceh-api/internal/models"
)

func Connect(cfg config.Config) (*gorm.DB, error) {
	gormDB, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		return nil, err
	}
	// database/sql keeps only 2 idle connections by default, so a burst of
	// parallel requests closes sockets it is about to need again — and each new
	// connection to a cross-region pooler pays a fresh TLS handshake.
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	return gormDB, nil
}

func Migrate(d *gorm.DB) error {
	return d.AutoMigrate(
		&models.Category{},
		&models.Shop{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.Admin{},
	)
}

// Seed inserts the demo catalog (migrated from the frontend's catalog.ts) and
// the default admin account, but only on a fresh database, so it never
// overwrites data an admin has since changed.
func Seed(d *gorm.DB, cfg config.Config) error {
	var categoryCount int64
	if err := d.Model(&models.Category{}).Count(&categoryCount).Error; err != nil {
		return err
	}
	if categoryCount == 0 {
		if err := seedCatalog(d); err != nil {
			return err
		}
	}

	var adminCount int64
	if err := d.Model(&models.Admin{}).Count(&adminCount).Error; err != nil {
		return err
	}
	if adminCount == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		admin := models.Admin{Username: cfg.AdminUsername, PasswordHash: string(hash)}
		if err := d.Create(&admin).Error; err != nil {
			return err
		}
		log.Printf("seeded default admin %q (password from ADMIN_PASSWORD env)", cfg.AdminUsername)
	}
	return nil
}

func strPtr(value string) *string { return &value }

func seedCatalog(d *gorm.DB) error {
	categories := []models.Category{
		{Slug: "kopi-aceh", Name: "Kopi Aceh", Short: "Kopi Aceh", Caption: "Dari dataran tinggi Gayo", Icon: strPtr("ikon-koleksi-0")},
		{Slug: "kue-camilan", Name: "Kue & Camilan", Short: "Camilan", Caption: "Resep turun temurun", Icon: strPtr("ikon-koleksi-1")},
		{Slug: "kerajinan", Name: "Kerajinan & Aksesori", Short: "Kerajinan", Caption: "Karya tangan perajin", Icon: strPtr("ikon-koleksi-2")},
		{Slug: "parfum", Name: "Parfum", Short: "Parfum", Caption: "Aroma khas Aceh", Icon: nil},
	}
	if err := d.Create(&categories).Error; err != nil {
		return err
	}

	shops := []models.Shop{
		{Slug: "ruang-gayo", Name: "Ruang Gayo", Origin: "Aceh Tengah", Description: "Biji kopi pilihan dari dataran tinggi Gayo, disangrai dalam kelompok kecil untuk menjaga karakter tiap panen."},
		{Slug: "dapur-cut-ida", Name: "Dapur Cut Ida", Origin: "Banda Aceh", Description: "Dapur rumahan yang merawat resep kue Aceh, dari lipatan timphan hingga anyaman halus keukarah."},
		{Slug: "rumoh-sulam", Name: "Rumoh Sulam", Origin: "Aceh Besar", Description: "Perajin lokal yang menerjemahkan motif khas Aceh ke dalam aksesori untuk dipakai sehari hari."},
	}
	if err := d.Create(&shops).Error; err != nil {
		return err
	}

	products := []models.Product{
		{Slug: "kopi-gayo-sangrai", Name: "Kopi Gayo Sangrai", CategoryID: categories[0].ID, ShopID: shops[0].ID, Price: 98000, Size: "250 g", ShelfLifeDays: 180, Stock: 24, ImageURL: strPtr("/img/studio-gayo.webp"), Description: "Arabika dataran tinggi Gayo dengan aroma kakao, rasa manis yang lembut, dan sentuhan rempah. Dikemas rapat agar kesegarannya terjaga sepanjang perjalanan."},
		{Slug: "keukarah-aceh", Name: "Keukarah Tradisional", CategoryID: categories[1].ID, ShopID: shops[1].ID, Price: 45000, Size: "200 g", ShelfLifeDays: 30, Stock: 22, ImageURL: strPtr("/img/studio-keukarah.webp"), Description: "Kue khas Aceh dari jalinan halus tepung beras yang digoreng hingga keemasan. Renyah, ringan, dan pas untuk menemani secangkir kopi."},
		{Slug: "dompet-sulam", Name: "Dompet Sulam Aceh", CategoryID: categories[2].ID, ShopID: shops[2].ID, Price: 85000, Size: "20 x 12 cm", ShelfLifeDays: 0, Stock: 12, ImageURL: strPtr("/img/studio-sulam.webp"), Description: "Dompet kain dengan sulaman motif khas Aceh berwarna merah dan emas. Ritsleting menjaga barang kecil tetap rapi selama perjalanan."},
		{Slug: "timphan-asoe-kaya", Name: "Timphan Asoe Kaya", CategoryID: categories[1].ID, ShopID: shops[1].ID, Price: 38000, Size: "6 buah", ShelfLifeDays: 2, Stock: 15, ImageURL: strPtr("/img/products-3.webp"), Description: "Kue kukus lembut berisi srikaya, dibalut daun pisang muda. Nikmati segera setelah diterima untuk rasa dan aroma terbaik."},
		{Slug: "robusta-gayo", Name: "Robusta Gayo", CategoryID: categories[0].ID, ShopID: shops[0].ID, Price: 65000, Size: "250 g", ShelfLifeDays: 180, Stock: 20, ImageURL: strPtr("/img/products-4.webp"), Description: "Kopi robusta sangrai dengan karakter cokelat pekat dan rasa yang mantap. Pilihan untuk seduhan pagi atau kopi susu di rumah."},
		{Slug: "tas-anyam-pandan", Name: "Tas Anyam Pandan", CategoryID: categories[2].ID, ShopID: shops[2].ID, Price: 145000, Size: "30 x 25 cm", ShelfLifeDays: 0, Stock: 8, ImageURL: strPtr("/img/products-5.webp"), Description: "Tas pandan berwarna alami dengan pola anyaman rapat dan pegangan melengkung. Ringan untuk dibawa berbelanja atau berjalan santai."},
	}
	if err := d.Create(&products).Error; err != nil {
		return err
	}
	log.Printf("seeded %d categories, %d shops, %d products", len(categories), len(shops), len(products))
	return nil
}
