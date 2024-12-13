package main

import (
	"log"
	"net/http"
	"os"

	"a21hc3NpZ25tZW50/database"
	"a21hc3NpZ25tZW50/handler"
	"a21hc3NpZ25tZW50/middleware"
	"a21hc3NpZ25tZW50/service"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

var fileService = &service.FileService{}
var aiService = &service.AIService{Client: &http.Client{}}
var store = sessions.NewCookieStore([]byte("my-key"))
var processedData map[string][]string
var authService = service.NewAuthService()

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
	protected.HandleFunc("/chat", handler.ChatHandler).Methods("POST")

	corsHandler := cors.New(cors.Options{ 
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	}).Handler(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}