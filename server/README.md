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
git clone [https://github.com/Jennah198/capstone-frontend.git](https://github.com/Jennah198/capstone-frontend.git)
cd capstone-frontend

```
### 2️⃣ Install Dependencies
```bash
npm install

```
### 3️⃣ Environment Configuration
Create a `.env` file in the  root directory and add the following variables:



```ini
VITE_API_URL=http://localhost:5000/api

```

## ▶️ Running the Application

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts server with **Nodemon** (auto-restart) |
| **Build** | `npm run build` | Compiles and optimizes for production|

The application will be accessible at: http://localhost:5173

---



## 🛡️ Security Best Practices
* **Environment-based configuration** for sensitive keys.
* **Secure password hashing** using salt rounds.
* **Token-based stateless authentication** (JWT).
* **CORS policy** restricted to trusted origins.

---

## 📜 License
This project is licensed under the **ISC License**.