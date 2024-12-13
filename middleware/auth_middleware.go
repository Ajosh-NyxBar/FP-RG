package middleware

import (
    "context"
    "log"
    "net/http"
    "strings"

    firebase "firebase.google.com/go"
    "firebase.google.com/go/auth"
    "google.golang.org/api/option"
)

func VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
    app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile("key/fprg-e9e87-firebase-adminsdk-f5rbi-a4cb40d58e.json"))
    if err != nil {
        return nil, err
    }

    client, err := app.Auth(ctx)
    if err != nil {
        return nil, err
    }

    token, err := client.VerifyIDToken(ctx, idToken)
    if err != nil {
        return nil, err
    }

    return token, nil
}

func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        idToken := r.Header.Get("Authorization")
        if idToken == "" {
            http.Error(w, "Authorization header missing", http.StatusUnauthorized)
            return
        }

        // Remove "Bearer " prefix from the token
        idToken = strings.TrimPrefix(idToken, "Bearer ")

        ctx := context.Background()
        token, err := VerifyIDToken(ctx, idToken)
        if err != nil {
            log.Println("Invalid token:", err)
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }

        // Set user information in context
        ctx = context.WithValue(ctx, "user", token)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}