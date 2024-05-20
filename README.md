# Flower E-Shop Project

## Introduction

Welcome to the Flower Shop Project! This web application is designed to provide users with a seamless experience in purchasing beautiful flower arrangements online. Whether you're looking to create a custom bouquet or browse through our curated selections, our platform ensures a delightful and hassle-free shopping experience. Additionally, our robust admin panel allows for efficient management of products, orders, and customer interactions.

## Main Features

### 1. Custom Bouquet Creation
### 2. Product Catalog
### 3. User Account Management
### 4. Admin Panel
### 5. Payment Integration

## How to launch

### 1. Open the Project

1. Open the archive in your integrated development environment (IDE).
    - In the IDE terminal, navigate to the `frontend` directory and execute the following commands:
      ```bash
      npm install
      npm start
      ```
    - Repeat the same steps for the `backend` directory:
      ```bash
      npm install
      npm start
      ```

### 2. Connecting to the Database

1. Install MongoDB on your computer or use a cloud-based service.
2. Create a `.env` file in the `backend` directory and input the following environment variables:
    ```env
    MONGODB_URI=""
    JWT_SECRET=""
    PORT=5000
    ```
3. Replace the empty quotes with your actual data:
    - The MongoDB URL can be obtained from your MongoDB application when you click "New Connection."
    - The JWT secret can be any combination of letters, numbers, and symbols.
4. To populate the database with initial data, open this URL in your browser:
    ```
    http://localhost:5000/api/seed
    ```

### 3. Connecting to PayPal

1. Log in to your PayPal developer account.
2. Find your PayPal client ID.
3. Insert this client ID into the `server.js` file (line 30).

---
