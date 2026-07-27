package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/duranruizsantiago-lang/zentra/internal/api"
	"github.com/duranruizsantiago-lang/zentra/internal/store"
)

func main() {
	ctx := context.Background()

	store, err := store.New(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer store.Close()

	server := api.NewServer(store)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("CertFlow API running on :%s
", port)
	if err := http.ListenAndServe(":"+port, server.Handler()); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
