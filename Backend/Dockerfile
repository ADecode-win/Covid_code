# Base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app


# Copy the FastAPI application files
COPY . /app
# Copy the requirements file and install dependencies

RUN pip install --no-cache-dir -r requirements.txt

# Expose the port the app runs on
EXPOSE 8000

# Command to run the Uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]