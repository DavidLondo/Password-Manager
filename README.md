# 🔐 Password Manager

**Password Manager** is a local, secure desktop application built with **Electron** and **React**. It allows you to store your passwords fully encrypted either on your computer or on a **NAS connected via VPN**, with automatic synchronization between both.

---

## 🚀 Features

- Modern, minimalist user interface
- AES-256 encryption and Argon2 for maximum security
- Secure password generator
- Works on **Windows**

---

## 📦 Requirements

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- Windows operating system

---

## ⚙️ Setup

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/password-manager.git
cd password-manager
```

2. **Install dependencies:**

```bash
npm install
```
3. **Run the app in development mode:**

```bash
npm run dev
```

4. **Storage location:**

To change the path where your passwords are stored:

  Open the security.js file.

  Locate this line:

```js
const HARDCODED_PATH = 'Z:\\DAVID\\Secure';
```

## 📦 About This App

This app was built with a specific personal setup in mind:
Storing passwords on a NAS (Network Attached Storage) drive connected via VPN.

## 📁 Project Structure

Password-Manager/
├── frontend/
├── node_modules/
├── .gitignore
├── icon.ico
├── LICENSE
├── main.js
├── package-lock.json
├── package.json
├── preload.js
└── security.js


## 🔐 Security

- Passwords are encrypted using AES-256-CBC, with a derived key from your master key (via SHA-256).
- The master key is hashed with Argon2 + salt and never stored in plaintext.
- All sensitive data is stored in local JSON files, which can be transferred between devices if needed.

## Author

Developed by DavidLondo — 2025
