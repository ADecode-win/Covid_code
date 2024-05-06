#!/bin/bash

# Build the Docker image
docker buildx build -t didi --load .

# Run the Docker container
docker run -d -p 8000:8000 --name app didi