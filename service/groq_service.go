package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type GroqService struct {
	Client *http.Client
}

func NewGroqService() *GroqService {
	return &GroqService{
		Client: &http.Client{},
	}
}

func (s *GroqService) RequestToGroq(prompt string) (string, error) {
	apiKey := os.Getenv("VITE_GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("API key is not set")
	}

	requestBody, err := json.Marshal(map[string]interface{}{
		"model": "llama3-8b-8192",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get response from GROQ model")
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from GROQ model")
	}

	return response.Choices[0].Message.Content, nil
}

func (s *GroqService) ProcessGroqQuery(query, token string) (string, error) {
	apiKey := os.Getenv("VITE_GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("API key is not set")
	}

	requestBody, err := json.Marshal(map[string]interface{}{
		"model": "llama3-8b-8192",
		"messages": []map[string]string{
			{"role": "user", "content": query},
		},
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get response from GROQ model")
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from GROQ model")
	}

	return response.Choices[0].Message.Content, nil
}
