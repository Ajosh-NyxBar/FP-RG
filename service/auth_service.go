package service

import (
    "a21hc3NpZ25tZW50/model"
    "errors"
)

type AuthService struct {
    users map[string]model.Register
}

func NewAuthService() *AuthService {
    return &AuthService{
        users: make(map[string]model.Register),
    }
}

func (s *AuthService) Register(user model.Register) error {
    if _, exists := s.users[user.Username]; exists {
        return errors.New("username sudah terdaftar")
    }

    s.users[user.Username] = user
    return nil
}

func (s *AuthService) Login(credentials model.Login) error {
    user, exists := s.users[credentials.Username]
    if !exists {
        return errors.New("username tidak ditemukan")
    }

    if user.Password != credentials.Password {
        return errors.New("password salah")
    }

    return nil
}