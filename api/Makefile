all: clone-be run

in:
	docker exec -it sk07-web bash

build:
	@echo "Building WEA_BE image..."
	docker build -t hejsekvojtech/wea_be:latest .

run:
	@echo "Running Docker Compose..."
	docker compose up -d --build

db:
	@echo "Starting DB..."
	docker compose up -d --build db

init:
	docker network inspect cdb-network >/dev/null 2>&1 || docker network create --driver bridge cdb-network