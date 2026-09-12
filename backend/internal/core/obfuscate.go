package core

import (
	"errors"

	"github.com/sqids/sqids-go"
)

var s *sqids.Sqids

func init() {
	var err error
	// Use a custom alphabet and min length to generate masked IDs like "X9aK2L"
	s, err = sqids.New(sqids.Options{
		MinLength: 8,
		Alphabet:  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	})
	if err != nil {
		panic(err)
	}
}

// EncodeID converts an int32 DB primary key to a masked string
func EncodeID(id int32) (string, error) {
	return s.Encode([]uint64{uint64(id)})
}

// DecodeID converts a masked string back to an int32 DB primary key
func DecodeID(hash string) (int32, error) {
	numbers := s.Decode(hash)
	if len(numbers) == 0 {
		return 0, errors.New("invalid ID format")
	}
	return int32(numbers[0]), nil
}
