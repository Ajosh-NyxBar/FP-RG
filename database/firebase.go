package database

import (
    "context"
    "log"
    "firebase.google.com/go"
    "google.golang.org/api/option"
)

func InitializeFirebase() (*firebase.App, error) {
    ctx := context.Background()
	sa := option.WithCredentialsFile("key/fprg-e9e87-firebase-adminsdk-f5rbi-a4cb40d58e.json")
	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
        return nil, err
    }
    return app, nil
}
