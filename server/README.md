# 🚀 Capstone Backend API

Event Management & Ticketing Platform API 
A robust **Node.js + Express + MongoDB** backend for the Capstone MERN Stack Project. This API provides secure authentication, cloud-based file management, integrated payment processing, and automated document generation.

---

## 📌 Features

* **🔐 Secure Auth:** JWT-based Authentication & Authorization with `bcrypt` password hashing.
* **🔑 Data Security:** Protected routes using custom middleware.
* **☁️ Cloud Storage:** Seamless file and image uploads via **Cloudinary**.
* **💳 Payments:** Full integration with the **Chapa** payment gateway.
* **📄 PDF Generation:** Dynamic PDF creation with embedded **QR codes** using PDFKit.
* **🗄️ Database:** Scalable data modeling using **MongoDB** and **Mongoose ODM**.
* **🌐 Integration Ready:** Fully configured **CORS** for frontend connectivity.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js (v5) |
| **Database** | MongoDB |
| **ORM/ODM** | Mongoose |
| **Authentication** | JWT, bcrypt |
| **File Upload** | Multer, Cloudinary |
| **Payments** | Chapa |
| **Utilities** | PDFKit, QRCode, UUID |

---

## 📁 Project Structure

```text
server/
│── src/
│   ├── config/         # Database & third-party service configs
│   ├── controllers/    # Business logic & request handling
│   ├── middlewares/    # Auth, validation, & error handling
│   ├── model/          # Mongoose schemas & data models
│   ├── routes/         # API route definitions
│   ├── uploads/        # Temporary local storage (optional)
│   └── index.js        # Main application entry point
│
│── .env                # Environment variables (Private)
│── .gitignore          # Files to ignore in Git
│── package.json        # Project dependencies & scripts
│── test_chapa.js       # Payment integration test script
└── test_import.js      # Utility test script
```

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone <https://github.com/Jennah198/capstone-backend.git>
cd capstone-backend/server

```
### 2️⃣ Install Dependencies
```bash
npm install

```
### 3️⃣ Environment Configuration
Create a `.env` file in the `server` root directory and add the following variables:

```

```ini
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Chapa Payment Configuration
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key

```

## ▶️ Running the Application

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts server with **Nodemon** (auto-restart) |
| **Production** | `npm start` | Starts server normally |

The server will be accessible at: `http://localhost:5000`

---

## 🔑 Key Workflows

### Authentication Flow
1. **Login:** User submits credentials → `bcrypt` verifies hashing → Server issues a **JWT**.
2. **Access:** Client sends JWT in the `Authorization` header.
3. **Verification:** Middleware validates the token before granting access to protected routes.

### File Uploads
* **Multer** handles `multipart/form-data` requests.
* Files are stored securely in the cloud via **Cloudinary**.

### Payment Integration
* Powered by **Chapa**.
* Supports payment initialization and verification.
* Test scripts included: `test_chapa.js`.

---

## 🧪 API Testing
Recommended tools for testing the RESTful endpoints:
* **Postman**

---

## 🛡️ Security Best Practices
* **Environment-based configuration** for sensitive keys.
* **Secure password hashing** using salt rounds.
* **Token-based stateless authentication** (JWT).
* **CORS policy** restricted to trusted origins.

