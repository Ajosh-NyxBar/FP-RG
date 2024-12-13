package handler

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "strings"

    "a21hc3NpZ25tZW50/model"
    "a21hc3NpZ25tZW50/service"

    "github.com/gorilla/sessions"
    "google.golang.org/api/option"
    "firebase.google.com/go"
    "firebase.google.com/go/auth"
)

var fileService = &service.FileService{}
var aiService = &service.AIService{Client: &http.Client{}}
var store = sessions.NewCookieStore([]byte("my-key"))
var processedData map[string][]string

func getSession(r *http.Request) *sessions.Session {
    session, _ := store.Get(r, "chat-session")
    return session
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
    var user model.Register
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Initialize Firebase
    app, err := firebase.NewApp(context.Background(), nil, option.WithCredentialsFile("key/fprg-e9e87-firebase-adminsdk-f5rbi-a4cb40d58e.json"))
    if err != nil {
        http.Error(w, "Error initializing Firebase", http.StatusInternalServerError)
        return
    }

    // Get Auth client
    client, err := app.Auth(context.Background())
    if err != nil {
        http.Error(w, "Error getting Auth client", http.StatusInternalServerError)
        return
    }

    params := (&auth.UserToCreate{}).
        Email(user.Username).
        Password(user.Password).
        EmailVerified(false)

    userRecord, err := client.CreateUser(context.Background(), params)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    response := map[string]string{
        "status": "success",
        "message": "User registered successfully",
        "uid": userRecord.UID,
    }
    json.NewEncoder(w).Encode(response)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var credentials model.Login
    if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Initialize Firebase
    app, err := firebase.NewApp(context.Background(), nil, option.WithCredentialsFile("key/fprg-e9e87-firebase-adminsdk-f5rbi-a4cb40d58e.json"))
    if err != nil {
        http.Error(w, "Error initializing Firebase", http.StatusInternalServerError)
        return
    }

    // Get Auth client
    client, err := app.Auth(context.Background())
    if err != nil {
        http.Error(w, "Error getting Auth client", http.StatusInternalServerError)
        return
    }

    // Get user by email
    userRecord, err := client.GetUserByEmail(context.Background(), credentials.Username)
    if err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    // Create custom token
    customToken, err := client.CustomToken(context.Background(), userRecord.UID)
    if err != nil {
        http.Error(w, "Error creating custom token", http.StatusInternalServerError)
        return
    }

    // Exchange custom token for ID token
    idToken, err := exchangeCustomTokenForIDToken(customToken)
    if err != nil {
        http.Error(w, "Error exchanging custom token for ID token", http.StatusInternalServerError)
        return
    }

    response := map[string]string{
        "status": "success",
        "message": "Login successful",
        "token": idToken,
    }
    json.NewEncoder(w).Encode(response)
}

func exchangeCustomTokenForIDToken(customToken string) (string, error) {
    apiKey := os.Getenv("FIREBASE_API_KEY")
    if apiKey == "" {
        return "", fmt.Errorf("FIREBASE_API_KEY environment variable is not set")
    }

    url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=%s", apiKey)
    payload := map[string]string{
        "token": customToken,
        "returnSecureToken": "true",
    }
    payloadBytes, err := json.Marshal(payload)
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
    if err != nil {
        return "", err
    }
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        bodyBytes, _ := ioutil.ReadAll(resp.Body)
        return "", fmt.Errorf("failed to exchange custom token: %s", string(bodyBytes))
    }

    var respData struct {
        IDToken string `json:"idToken"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
        return "", err
    }

    return respData.IDToken, nil
}

func UploadHandler(w http.ResponseWriter, r *http.Request) {
    file, _, err := r.FormFile("file")
    if err != nil {
        log.Println("Error retrieving file:", err)
        http.Error(w, "Failed to retrieve file", http.StatusBadRequest)
        return
    }   
    defer file.Close()

    fileContent, err := ioutil.ReadAll(file)
    if err != nil {
        log.Println("Error reading file content:", err)
        http.Error(w, "Failed to read file content", http.StatusInternalServerError)
        return
    }

    data, err := fileService.ProcessFile(string(fileContent))
    if err != nil {
        log.Println("Error processing file:", err)
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    loginToken := r.Header.Get("Authorization")
    if loginToken == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }
    loginToken = strings.TrimPrefix(loginToken, "Bearer ")

    processedData = data

    token := os.Getenv("HUGGINGFACE_TOKEN")
    answer, err := aiService.AnalyzeData(data, "query", token)
    if err != nil {
        log.Println("Error from AnalyzeData:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    response := map[string]string{"status": "success", "answer": answer}
    json.NewEncoder(w).Encode(response)
}

func CSVQueryHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Query string `json:"query"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    loginToken := r.Header.Get("Authorization")
    if loginToken == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }
    loginToken = strings.TrimPrefix(loginToken, "Bearer ")

    data := processedData

    token := os.Getenv("HUGGINGFACE_TOKEN")
    answer, err := aiService.AnalyzeData(data, req.Query, token)
    if err != nil {
        log.Println("Error from AnalyzeData:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    response := map[string]string{"status": "success", "answer": answer}
    json.NewEncoder(w).Encode(response)
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Query string `json:"query"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    session := getSession(r)
    context, ok := session.Values["context"].(string)
    if !ok {
        context = ""
    }

    loginToken := r.Header.Get("Authorization")
    if loginToken == "" {
        http.Error(w, "Authorization header missing", http.StatusUnauthorized)
        return
    }
    loginToken = strings.TrimPrefix(loginToken, "Bearer ")

    token := os.Getenv("HUGGINGFACE_TOKEN")
    answer, err := aiService.ChatWithAI(context, req.Query, token)
    if err != nil {
        log.Println("Error from ChatWithAI:", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    session.Values["context"] = context + " " + req.Query
    session.Save(r, w)

    response := map[string]string{"status": "success", "answer": answer.GeneratedText}
    json.NewEncoder(w).Encode(response)
}