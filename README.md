# Ecommerce Backend API

A RESTful ecommerce backend API built with **Node.js, Express, TypeScript, MongoDB, and Mongoose**. The API provides product management, authentication, API documentation, and cloud-based image management with Cloudinary.

## 🚀 Features

* User authentication
* JWT-based authorization
* Product CRUD operations
* MongoDB database integration
* Mongoose data validation
* Product image management with Cloudinary
* RESTful API architecture
* Swagger API documentation
* Environment variable configuration
* TypeScript for type safety
* Error handling and validation

## 🛠️ Technologies

* **Node.js** — JavaScript runtime
* **Express.js** — Web framework
* **TypeScript** — Static typing
* **MongoDB** — NoSQL database
* **Mongoose** — MongoDB object modeling
* **JWT** — Authentication and authorization
* **Cloudinary** — Image storage and optimization
* **Swagger** — API documentation
* **Nodemon** — Development server
* **ts-node** — Running TypeScript directly

## 📁 Project Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── cloudinary.ts
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── productController.ts
│   │
│   ├── middleware/
│   │   └── authMiddleware.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   └── Product.ts
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── productRoutes.ts
│   │
│   ├── types/
│   │   └── ...
│   │
│   ├── swagger.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/rukundo0023/ecommerce-project.git
```

### 2. Navigate to the backend

```bash
cd ecommerce-project/backend
```

### 3. Install dependencies

```bash
npm install
```

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

AUTH_TOKEN_SECRET=your_random_secret_at_least_32_characters_long
ADMIN_PASSWORD=choose_a_strong_password_between_8_and_128_characters
FRONTEND_URL=https://your-frontend.example.com

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_sender_email
```

Password reset emails link to
`{FRONTEND_URL}/reset-password?token=...`. The frontend should provide a form
that submits the token and new password to `POST /api/auth/reset-password`.
Only HTTPS URLs are accepted, except for `http://localhost` during local
development.

On startup, the backend creates or updates the administrator account
`Rukundo Nshimiyimana` (`clevisrukundo@gmail.com`) using `ADMIN_PASSWORD`.
This password is synchronized from the environment on each startup. Keep it
private and do not commit `.env`. Only this administrator can create, update,
or delete products; authenticated users can still browse products and place
orders.

SMTP settings are required to send welcome emails after registration. If they
are missing or email delivery fails, registration still succeeds and the
failure is logged by the server.

### Password reset

Request a reset email with `POST /api/auth/forgot-password` and a JSON body
containing `{ "email": "customer@example.com" }`. The endpoint returns the same
response whether the address is registered or not. Reset links expire after
30 minutes; a new request invalidates any previous link.

Submit the link's token and a new password (8–128 characters) to
`POST /api/auth/reset-password` as
`{ "token": "...", "password": "..." }`. The token is one-time, and its stored
form is hashed.

### Important

Never commit `.env` to GitHub.

Your `.gitignore` should contain:

```gitignore
node_modules/
.env
dist/
coverage/
```

## ▶️ Running the Application

### Development

```bash
npm run dev
```

The server will run on:

```text
http://localhost:5000
```

### Production

Build the TypeScript application:

```bash
npm run build
```

Then start it:

```bash
npm start
```

## 📚 API Documentation

Swagger documentation is available at:

```text
http://localhost:5000/api-docs
```

Swagger provides an interactive interface for viewing and testing the available API endpoints.

## 🔑 Authentication

The API uses **JWT (JSON Web Token)** for authentication.

A typical authentication flow is:

```text
Register
   ↓
Login
   ↓
Receive JWT token
   ↓
Send token with protected requests
```

Protected requests use:

```http
Authorization: Bearer YOUR_TOKEN
```

## 🛍️ Product API

### Create a product

```http
POST /api/products
```

Example request:

```json
{
  "name": "Laptop",
  "price": 850000,
  "description": "Dell laptop with 8GB RAM and 256GB SSD",
  "quantity": 10
}
```

### Get all products

```http
GET /api/products
```

### Get a product by ID

```http
GET /api/products/:id
```

### Update a product

```http
PUT /api/products/:id
```

### Partially update a product

```http
PATCH /api/products/:id
```

### Delete a product

```http
DELETE /api/products/:id
```

## 👤 Authentication API

### Register

```http
POST /api/auth/register
```

Example:

```json
{
  "name": "Jane Doe",
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Login

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

The login endpoint returns an authentication token that can be used to access protected endpoints.

### Orders

Place an order for a product using a bearer token returned by registration or
login:

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "productId": "your_product_id",
  "quantity": 2
}
```

The API checks available stock and records the product name and price at the
time of purchase, then sends an order confirmation email to the account email.
Configure the SMTP environment variables described above to enable delivery.
An email delivery failure is logged and does not cancel a successfully placed
order. Retrieve only your own orders with `GET /api/orders` using the same
bearer token.

## 🖼️ Cloudinary

Cloudinary is used to manage product images.

The application follows this general flow:

```text
Client
  ↓
Express API
  ↓
Cloudinary
  ↓
Image URL
  ↓
MongoDB
```

MongoDB stores the product information and the image URL, while Cloudinary handles the actual image storage and delivery.

## 🗄️ Database

The project uses **MongoDB Atlas** as the database service.

Mongoose is used to define schemas and validate product and user data.

Example product:

```json
{
  "_id": "product_id",
  "name": "Laptop",
  "price": 850000,
  "description": "Dell laptop with 8GB RAM",
  "quantity": 10,
  "image": "cloudinary_image_url"
}
```

## 🧪 Testing the API

You can test the API using:

* Swagger UI
* Postman
* Thunder Client
* Insomnia

Example:

```text
POST http://localhost:5000/api/products
```

with:

```json
{
  "name": "Wireless Mouse",
  "price": 15000,
  "description": "Wireless optical mouse",
  "quantity": 25
}
```

## 🔄 API Request Lifecycle

A typical request passes through the application as follows:

```text
Client
  ↓
HTTP Request
  ↓
Express
  ↓
Middleware
  ↓
Route
  ↓
Controller
  ↓
Model
  ↓
MongoDB
  ↓
Controller
  ↓
HTTP Response
  ↓
Client
```

For protected endpoints:

```text
Client
  ↓
Authentication Middleware
  ↓
JWT Verification
  ↓
Route
  ↓
Controller
  ↓
MongoDB
  ↓
Response
```

## 📌 HTTP Status Codes

The API uses standard HTTP status codes:

| Status | Meaning               |
| ------ | --------------------- |
| `200`  | Request successful    |
| `201`  | Resource created      |
| `400`  | Bad request           |
| `401`  | Unauthorized          |
| `403`  | Forbidden             |
| `404`  | Resource not found    |
| `500`  | Internal server error |

## 🔒 Security

The project follows several basic security practices:

* Passwords should be hashed before storage.
* JWT secrets are stored in environment variables.
* Cloudinary API secrets are stored in environment variables.
* MongoDB credentials are not committed to GitHub.
* Protected routes require authentication.
* Input validation is performed using Mongoose/application validation.

## 📦 Useful Commands

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Start production server:

```bash
npm start
```

Check Git status:

```bash
git status
```

Commit changes:

```bash
git add .
git commit -m "Update backend"
```

Push changes:

```bash
git push
```

## 🌐 Repository

GitHub:

https://github.com/rukundo0023/ecommerce-project

## 👨‍💻 Author

**Rukundo Nshimiyimana**

Software Engineering graduate interested in backend development, APIs, databases, and AI/ML technologies.

## 📄 License

This project is developed for learning and portfolio purposes.
