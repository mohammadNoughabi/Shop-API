# Shop API - Type-Safe E-Commerce Backend

A robust, production-ready e-commerce RESTful API built with **Node.js**, **Express 5**, and **TypeScript**. This project emphasizes reliability through strict **Zod** validation, a modular **Feature-First** architecture, and high-fidelity integration testing using **Testcontainers**.

---

## 🚀 Key Features

- **Express 5.x Implementation:** Utilizing the latest Express features for better error handling and performance.
- **Feature-First Architecture:** Organized by domain (Product, Auth, Order, etc.) for high maintainability.
- **Real Integration Testing:** Automated tests spin up real **MongoDB** instances via **Docker (Testcontainers)**—no more mocking the database.
- **Security & Auth:** JWT-based authentication using HTTP-only cookies, RBAC (Role-Based Access Control), and rate limiting.
- **Payment Integration:** Ready for **Zarinpal** payment gateway.
- **File Handling:** Multi-file and gallery uploads using **Multer**.
- **Quality Control:** Strict Linting (ESLint), Formatting (Prettier), and Git Hooks (Husky/Lint-staged).

---

## 🛠 Tech Stack

| Category       | Technology                        |
| :------------- | :-------------------------------- |
| **Runtime**    | Node.js (v20+)                    |
| **Language**   | TypeScript                        |
| **Framework**  | Express 5.0                       |
| **Database**   | MongoDB (Mongoose)                |
| **Caching**    | Redis                             |
| **Validation** | Zod                               |
| **Testing**    | Vitest, Supertest, Testcontainers |
| **Utilities**  | Bcrypt, Nodemailer, Axios, Multer |

---

## 🏗 Architecture Overview

The project follows a **Modular Monolith** pattern. Each domain inside `src/APIs/` is self-contained, encapsulating its own routes, logic, and data definitions.

### Folder Structure

- **`src/APIs/`**: Feature-based modules (e.g., `product/`, `authentication/`).
- **`src/middlewares/`**: Global security, validation, and error-handling logic.
- **`src/types/`**: Global TypeScript definitions and Express namespace extensions.
- **`test/`**: Comprehensive test suite including factories and global setup.

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **Docker Desktop** (Essential for running the integration test suite)
- **Redis** (Required for OTP and session management)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mohammadNoughabi/Shop-API.git
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup Environment:**
   Create a `development.env` file in the root:

   ```bash
   cp example.env development.env
   ```

### Environment Variables

Configure your `.env` files with the following keys:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/shop
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
SESSION_SECRET=strong_session_secret
ZARINPAL_MERCHANT_ID=your_id
```

### Running the API

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| **npm run dev**   | Runs the API in watch mode using development.env |
| **npm run build** | Compiles TypeScript to JavaScript in dist/       |
| **npm run start** | Runs the production build using production.env   |

## 🧪Testing Strategy

This project uses a "Real-World" testing approach. Integration tests use Testcontainers to pull a mongo:8 Docker image, ensuring your tests run against the exact same database engine used in production.

- Run all tests: npm test
- Watch mode: npm run test:watch
- Coverage report: npm run test:coverage
- UI Dashboard: npm run test:ui

## 📑 API Documentation (Sample)

Authentication

- POST /api/auth/register - Create new user.
- POST /api/auth/login - Authenticate & receive cookies.
- POST /api/auth/forgot-pass - Request password reset code via Email.

Products

- GET /api/product - List all products.
- POST /api/product - (Admin Only) Create product with image & gallery upload.
- DELETE /api/product/:id - (Admin Only) Soft delete product.

## 🛡 Validation & Error Handling

Data integrity is enforced at the entry point using Zod middleware.

- Body Validation: Checks inputs like email, password length, etc.
- Params Validation: Ensures id strings are valid MongoDB ObjectIds.
- Global Error Handler: Catches all asynchronous errors and returns a consistent JSON structure.

## 🗄 Database Schema

The system manages several interconnected models:

- User: Identity and Role management.
- Product: Catalog items with stock tracking and categories.
- Order/Cart: Transactional data flow.
- Payment: Records of Zarinpal transactions.

## 🤝 Contributing

1. Ensure you have Docker running.
2. Make your changes.
3. On git commit, ESLint and Prettier will run automatically via lint-staged.
4. Ensure all tests pass with npm test.
