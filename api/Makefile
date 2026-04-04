.PHONY: dev docker backend frontend help

help:
	@echo "Available commands:"
	@echo "  make dev       - Start everything (Docker + Backend + Frontend)"
	@echo "  make docker    - Start MySQL Docker container"
	@echo "  make backend   - Start .NET backend"
	@echo "  make frontend  - Start React frontend"

dev: docker backend frontend
	@echo "All services are starting..."
	@echo "Frontend:  http://localhost:3000"
	@echo "Backend:   http://localhost:5118"
	@echo "MySQL:     localhost:5006"

docker:
	@echo "Starting MySQL Docker container..."
	docker compose up -d

backend:
	@echo "Starting .NET backend..."
	cd api && dotnet run

frontend:
	@echo "Starting React frontend..."
	cd ../frontend && npm run dev