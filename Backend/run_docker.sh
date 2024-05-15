#!/bin/bash

# Build the Docker image
docker buildx build -t didi --load .

# Run the Docker container with volume mount for auto-reloading
docker run -d -p 8000:8000 --name app -v $(pwd):/app didi