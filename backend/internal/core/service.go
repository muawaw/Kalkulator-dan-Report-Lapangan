package core

import "context"

type Service interface {
	Config(ctx context.Context) error
}

type svc struct {
}

func NewService() Service {
	return &svc{}
}

func (s *svc) Config(ctx context.Context) error {
	return nil
}
