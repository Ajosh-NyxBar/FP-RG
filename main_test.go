package main_test

import (
	"a21hc3NpZ25tZW50/model"
	"a21hc3NpZ25tZW50/service"
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

// MockClient for testing AIService
type MockClient struct {
	RoundTripFunc func(req *http.Request) (*http.Response, error)
}

func (m *MockClient) RoundTrip(req *http.Request) (*http.Response, error) {
	return m.RoundTripFunc(req)
}

var _ = Describe("FileService", func() {
	var fileService *service.FileService

	BeforeEach(func() {
		fileService = &service.FileService{}
	})

	Describe("ProcessFile", func() {
		It("should return the correct result for valid CSV data", func() {
			fileContent := `header1,header2
value1,value2
value3,value4`
			expected := map[string][]string{
				"header1": {"value1", "value3"},
				"header2": {"value2", "value4"},
			}

			result, err := fileService.ProcessFile(fileContent)
			Expect(err).ToNot(HaveOccurred())
			Expect(result).To(Equal(expected))
		})

		It("should return an error for empty CSV data", func() {
			fileContent := ``

			result, err := fileService.ProcessFile(fileContent)
			Expect(err).To(HaveOccurred())
			Expect(result).To(BeNil())
		})

		It("should return an error for invalid CSV data", func() {
			fileContent := `header1,header2
value1,value2
value3`

			result, err := fileService.ProcessFile(fileContent)
			Expect(err).To(HaveOccurred())
			Expect(result).To(BeNil())
		})
	})
})

var _ = Describe("AIService", func() {
	var (
		mockClient *MockClient
		aiService  *service.AIService
	)

	BeforeEach(func() {
		mockClient = &MockClient{}
		aiService = &service.AIService{Client: &http.Client{Transport: mockClient}}
	})

	Describe("AnalyzeData", func() {
		It("should return the correct result for a valid response", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`{"answer":"result"}`)),
				}, nil
			}

			table := map[string][]string{
				"header1": {"value1", "value2"},
			}
			query := "query"
			token := "token"

			result, err := aiService.AnalyzeData(table, query, token)
			Expect(err).ToNot(HaveOccurred())
			Expect(result).To(Equal("result"))
		})

		It("should return an error for an empty table", func() {
			table := map[string][]string{}
			query := "query"
			token := "token"

			result, err := aiService.AnalyzeData(table, query, token)
			Expect(err).To(HaveOccurred())
			Expect(result).To(BeEmpty())
		})

		It("should return an error for an error response", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusInternalServerError,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`{"error":"internal error"}`)),
				}, nil
			}

			table := map[string][]string{
				"header1": {"value1", "value2"},
			}
			query := "query"
			token := "token"

			result, err := aiService.AnalyzeData(table, query, token)
			Expect(err).To(HaveOccurred())
			Expect(result).To(BeEmpty())
		})
	})

	Describe("ChatWithAI", func() {
		It("should return the correct response for a valid request", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`[{"generated_text":"response"}]`)),
				}, nil
			}

			context := "context"
			query := "query"
			token := "token"

			result, err := aiService.ChatWithAI(context, query, token)
			Expect(err).ToNot(HaveOccurred())
			Expect(result.GeneratedText).To(Equal("response"))
		})

		It("should return an error for an error response", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusInternalServerError,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`{"error":"internal error"}`)),
				}, nil
			}

			context := "context"
			query := "query"
			token := "token"

			result, err := aiService.ChatWithAI(context, query, token)
			Expect(err).To(HaveOccurred())
			Expect(result.GeneratedText).To(BeEmpty())
		})
	})
})

var _ = Describe("Auth Handlers", func() {
	var authService *service.AuthService

	BeforeEach(func() {
		authService = service.NewAuthService()
	})

	Context("RegisterHandler", func() {
		It("should return status OK for a valid registration", func() {
			reqBody, _ := json.Marshal(map[string]string{
				"username": "testuser",
				"password": "password",
			})
			req, err := http.NewRequest("POST", "/register", bytes.NewBuffer(reqBody))
			Expect(err).ToNot(HaveOccurred())

			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				var user model.Register
				json.NewDecoder(r.Body).Decode(&user)
				err := authService.Register(user)
				if err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}
				w.WriteHeader(http.StatusOK)
			})
			handler.ServeHTTP(rr, req)

			Expect(rr.Code).To(Equal(http.StatusOK))
		})
	})

	Context("LoginHandler", func() {
		It("should return status OK for a valid login", func() {
			// Register the user first
			authService.Register(model.Register{Username: "testuser", Password: "password"})

			reqBody, _ := json.Marshal(map[string]string{
				"username": "testuser",
				"password": "password",
			})
			req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(reqBody))
			Expect(err).ToNot(HaveOccurred())

			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				var credentials model.Login
				json.NewDecoder(r.Body).Decode(&credentials)
				err := authService.Login(credentials)
				if err != nil {
					http.Error(w, err.Error(), http.StatusUnauthorized)
					return
				}
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(map[string]string{"status": "success"})
			})
			handler.ServeHTTP(rr, req)

			Expect(rr.Code).To(Equal(http.StatusUnauthorized))
		})
	})
})

var _ = Describe("GroqService", func() {
	var (
		mockClient *MockClient
		groqService *service.GroqService
	)

	BeforeEach(func() {
		mockClient = &MockClient{}
		groqService = &service.GroqService{Client: &http.Client{Transport: mockClient}}
	})

	Describe("RequestToGroq", func() {
		It("should return the correct response for a valid request", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`{"choices":[{"message":{"content":"response"}}]}`)),
				}, nil
			}

			result, err := groqService.RequestToGroq("prompt")
			Expect(err).ToNot(HaveOccurred())
			Expect(result).To(Equal("response"))
		})

		It("should return an error for an invalid API key", func() {
				mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
					return &http.Response{
						StatusCode: http.StatusUnauthorized,
						Body:       ioutil.NopCloser(bytes.NewBufferString(`{"error":"invalid API key"}`)),
					}, nil
				}

				result, err := groqService.RequestToGroq("prompt")
				Expect(err).To(HaveOccurred())
				Expect(result).To(BeEmpty())
		})
	})

	Describe("ProcessGroqQuery", func() {
		It("should return the correct response for a valid query", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`{"choices":[{"message":{"content":"query response"}}]}`)),
				}, nil
			}

			result, err := groqService.ProcessGroqQuery("query", "token")
			Expect(err).ToNot(HaveOccurred())
			Expect(result).To(Equal("query response"))
		})

		It("should return an error for a failed request", func() {
			mockClient.RoundTripFunc = func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusInternalServerError,
					Body:       ioutil.NopCloser(bytes.NewBufferString(`{"error":"internal error"}`)),
				}, nil
			}

			result, err := groqService.ProcessGroqQuery("query", "token")
			Expect(err).To(HaveOccurred())
			Expect(result).To(BeEmpty())
		})
	})
})

