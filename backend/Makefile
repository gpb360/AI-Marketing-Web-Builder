# AI Marketing Web Builder Backend Makefile

.PHONY: help install dev test lint format clean build up down logs migrate shell

# Default target
help:
	@echo "Available commands:"
	@echo "  install    Install dependencies"
	@echo "  dev        Run development server"
	@echo "  test       Run tests"
	@echo "  lint       Run linting"
	@echo "  format     Format code"
	@echo "  clean      Clean up files"
	@echo "  build      Build Docker image"
	@echo "  up         Start services with docker-compose"
	@echo "  down       Stop services"
	@echo "  logs       View logs"
	@echo "  migrate    Run database migrations"
	@echo "  shell      Open shell in container"

# Install dependencies
install:
	pip install -r requirements.txt
	pre-commit install

# Run development server
dev:
	python run.py

# Run tests
test:
	pytest

# Run linting
lint:
	flake8 app/
	mypy app/

# Format code
format:
	black app/
	isort app/

# Clean up
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

# Docker commands
build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f backend

# Database migrations
migrate:
	alembic upgrade head

migrate-create:
	alembic revision --autogenerate -m "$(MSG)"

migrate-downgrade:
	alembic downgrade -1

# Development utilities
shell:
	docker-compose exec backend bash

db-shell:
	docker-compose exec postgres psql -U postgres -d ai_marketing_builder

redis-shell:
	docker-compose exec redis redis-cli

# Setup development environment
setup-dev:
	cp .env.example .env
	make install
	make up
	sleep 10
	make migrate

# Reset database
reset-db:
	docker-compose down -v
	docker-compose up -d postgres redis
	sleep 5
	make migrate