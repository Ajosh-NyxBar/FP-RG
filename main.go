package main

import (
	"log"
	"net/http"
	"os"

	"a21hc3NpZ25tZW50/database"
	"a21hc3NpZ25tZW50/handler"
	"a21hc3NpZ25tZW50/middleware"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

var store = sessions.NewCookieStore([]byte("my-key"))

func getSession(r *http.Request) *sessions.Session {
	session, _ := store.Get(r, "chat-session")
	return session
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	token := os.Getenv("HUGGINGFACE_TOKEN")
	if token == "" {
		log.Fatal("HUGGINGFACE_TOKEN is not set in the .env file")
	}

	// Inisialisasi Firebase
	_, err = database.InitializeFirebase()
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	router := mux.NewRouter()

	// Public routes (tidak perlu autentikasi)
	router.HandleFunc("/register", handler.RegisterHandler).Methods("POST")
	router.HandleFunc("/login", handler.LoginHandler).Methods("POST")
	
	// Protected routes (perlu autentikasi)
	protected := router.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/upload", handler.UploadHandler).Methods("POST")
	protected.HandleFunc("/csv-query", handler.CSVQueryHandler).Methods("POST")
	protected.HandleFunc("/chat", handler.GroqHandler).Methods("POST")
	protected.HandleFunc("/analyze", handler.AnalyzeHandler).Methods("POST")
	protected.HandleFunc("/analyze-image", handler.AnalyzeImageHandler).Methods("POST") 

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)
	log.Fatal(http.ListenAndServe(":8080", handler))
}