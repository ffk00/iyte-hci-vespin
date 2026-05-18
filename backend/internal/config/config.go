package config

import (
	"fmt"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	AppEnv      string `env:"APP_ENV" envDefault:"development"`
	Addr        string `env:"APP_ADDR" envDefault:":8080"`
	DatabaseURL string `env:"DATABASE_URL" envRequired:"true"`
	JWTSecret   string `env:"JWT_SECRET" envRequired:"true"`
	LogLevel    string `env:"LOG_LEVEL" envDefault:"info"`
}

func Load() (Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return Config{}, fmt.Errorf("load config: %w", err)
	}
	return cfg, nil
}
