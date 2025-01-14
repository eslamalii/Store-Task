# NestJS Store API

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [How to Run Tests](#how-to-run-tests)
- [API Usage Examples](#api-usage-examples)
- [Project Structure](#project-structure)

## Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://store-task-production.up.railway.app/api-docs)

## Features

- User Authentication with JSON Web Tokens (JWT)
- Role-Based Access Control (Admin/User)
- Product Management (CRUD operations)
- SQLite Database as the data store
- API Documentation with Swagger
- Comprehensive Logging with Winston
- Unit Testing with Jest

## Prerequisites

- Node.js
- npm
- Python (for SQLite3 build dependencies)
- Xcode Command Line Tools (for macOS)

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone
   cd store-task
   ```

2. Install OS-specific build tools:

**For Windows:**

```bash
# Install Python
winget install Python.Python.3.11

# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Verify Python installation
python --version
```

**For macOS:**

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Python using Homebrew
brew install python

# Verify Python installation
python3 --version
```

3. Install dependencies:

```bash
# Install node-gyp globally
npm install -g node-gyp

# Install project dependencies
npm install
```

4. Set environment variables:

   ```plaintext
   JWT_SECRET="your_secret_key"
   PORT=3000
   ```

## Running the Application

- Development mode:

  ```bash
  npm run start:dev
  ```

Enables hot-reloading for local development.

- Production mode:
  ```bash
  npm run build
  npm run start:prod
  ```

Access Swagger API documentation (if enabled) at:
`http://localhost:3000/api-docs`

## How to Run Tests

- Unit tests:
  ```bash
  npm run test
  ```
- Test coverage:
  ```bash
  npm run test:cov
  ```

## API Usage Examples

- Register a New User:

  ```http
  POST /auth/register
  Content-Type: application/json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "user"  // Optional, defaults to "user"
  }
  ```

- Login:

  ```http
  POST /auth/login
  Content-Type: application/json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

  Returns a JWT token for Authorization header.

- Get All Products (Public):

  ```http
  GET /products
  ```

- Get a Specific Product by ID (Public):

  ```http
  GET /products/:id
  ```

- Create a New Product (Requires Admin):

  ```http
  POST /products
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "name": "Product Name",
    "description": "Product Description",
    "price": 19.99,
    "stock": 100
  }
  ```

- Update a Product (Requires Admin):

  ```http
  PUT /products/:id
  Authorization: Bearer <token>
  Content-Type: application/json
  {
    "name": "Updated Name",
    "price": 29.99
  }
  ```

- Delete a Product (Requires Admin):
  ```http
  DELETE /products/:id
  Authorization: Bearer <token>
  ```

## Project Structure

- `src/`
  - `auth/` - Authentication module
  - `products/` - Products module
  - `config/` - Configuration files
  - `logger/` - Logging module
  - `app.module.ts` - Main application module
  - `main.ts` - Application entry point

## Docker

- Docker installed on your machine
- Docker Compose (optional)

### Building and Running with Docker

1. Build the Docker image:

```bash
docker build -t store-api .
```

2. Run the Docker container:

```bash
docker run -p 3000:3000 --env-file .env store-api
```
