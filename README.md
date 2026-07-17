# 📚 eBook Store

**eBook Store** is a university project built to demonstrate a full-stack MERN application. The platform allows users to browse, sign up, and purchase digital books. The platform provides a simple, user-friendly interface with secure account management and a seamless browsing experience.

---

## 📝 Table of Contents

- [Description](#description)
- [Screenshots](#screenshots)
- [Features](#features)
- [Future Enhancements](#future-enhancements)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## <a id="description"></a>  📖 Description

This project was developed as part of a university assignment to build a functional full-stack application.
The goal is to implement an eBook marketplace where users can explore titles, preview them, and download premium & freemium books.

---

## <a id="screenshots"></a>  📸 Screenshots
<details>
  <summary><b>Home Page / Browsing</b> (Click to expand)</summary>
  <br>
  <img width="100%" alt="Ayod-Ebookstore" src="https://github.com/user-attachments/assets/f5b38fcc-c00b-438e-ab49-268c0be3795e" />
  <img width="100%" alt="Ayod-Ebookstore (7)" src="https://github.com/user-attachments/assets/c620fb95-c66b-47b0-b31d-184086363e6d" />
  <img width="100%" alt="Ayod-Ebookstore (1)" src="https://github.com/user-attachments/assets/b51ca915-275c-4bc5-b27b-71e338ce3ddb" />
</details>

<details>
  <summary><b>Book Details & Cover</b> (Click to expand)</summary>
  <br>
  <img width="100%" alt="Ayod-Ebookstore (6)" src="https://github.com/user-attachments/assets/ef1210ae-ac94-456e-93e9-077475c31c7e" />
</details>

<details>
  <summary><b>Shopping Cart & Admin Dashboard</b> (Click to expand)</summary>
  <br>
   <img width="1343" height="682" alt="Ayod-Ebookstore (2)" src="https://github.com/user-attachments/assets/92607539-f2ac-4b1d-a497-9fe2dd5e32e1" />
   <img width="1343" height="682" alt="Ayod-Ebookstore (4)" src="https://github.com/user-attachments/assets/21f572c1-5685-4428-9e22-47faad22567d" />
  </details>

---


## <a id="features"></a> ✨ Features

- User registration and login (authentication system)  
- Browse and search eBooks & audiobooks
- View book details and cover images  
- Add books to a shopping cart  
- Freemium and premium eBook options
- Simulated Secure Payment Flow 

---

## <a id="future-enhancements"></a>🚀 Future Enhancements

While the core functionality is complete, the following features are planned or acknowledged as future improvements:
- **Mobile Responsiveness:** Adapting the UI for optimal viewing on smaller screens.
- **Dark Mode:** A toggle for better accessibility and user preference.
- **Push Notifications:** Alerts for new book releases or cart updates.
- **Child Mode:** Content filtering for younger readers.
- **Admin & Moderation Tools:** Capabilities for user suspension.
- **Automated Refund Processing:** Streamlined handling of returns or disputed purchases.

---

## <a id="technologies-used"></a>🛠️ Technologies Used

- **Frontend:** React.js, Bootstrap (customized with SCSS)  
- **Backend:** Node.js, Express.js, MongoDB (MERN stack)  
- **Authentication:** Firebase  
- **Storage:** Cloudinary  
- **Version Control:** Git & GitHub    

---

## <a id="getting-started"></a>🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Senurcreate/ebookStore_NGPR_1.git
```

### 2. Set up Environment Variables
You will need to create two `.env` files (one in the frontend and one in the backend) to run this project locally.

**Frontend Environment Variables**
Create a `.env` file in the `/frontend` directory and add the following keys. Replace the placeholder values with your own Firebase and EmailJS credentials:

```env
VITE_API_KEY="your_firebase_api_key"
VITE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_PROJECT_ID="your_project_id"
VITE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
VITE_MESSAGING_SENDER_ID="your_sender_id"
VITE_APP_ID="your_app_id"
VITE_MEASUREMENT_ID="your_measurement_id"

VITE_API_URL="http://localhost:3000/api"

VITE_EMAILJS_SERVICE_ID="your_emailjs_service_id"
VITE_EMAILJS_TEMPLATE_ID="your_emailjs_template_id"
VITE_EMAILJS_PUBLIC_KEY="your_emailjs_public_key"
```
<br>

**Backend Environment Variables**
Create a `.env` file in the `/backend` directory and add the following keys. Make sure to input your actual MongoDB URI and Firebase Admin SDK credentials:

```env
# Database
DB_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0"

# Firebase Admin Configuration
FIREBASE_TYPE="service_account"
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_PRIVATE_KEY_ID="your_private_key_id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@your_project_id.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="your_client_id"
FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
FIREBASE_AUTH_PROVIDER_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
FIREBASE_CLIENT_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/your_client_email"
FIREBASE_UNIVERSE_DOMAIN="googleapis.com"

# Download Settings
PREMIUM_MAX_DOWNLOADS=3
DOWNLOAD_WINDOW_HOURS=24
FREE_MAX_DOWNLOADS=1

# Preview Settings
PREVIEW_PAGES=20
```

### 3. Install Dependencies and Run Servers

**Frontend**
```bash
cd frontend
npm ci
npm run dev
```

**Backend**
```bash
cd backend
npm ci
npm run dev
```
   
---

## <a id="project-structure"></a>📦 Project Structure

```bash
/frontend    → React UI (Bootstrap + SCSS)
/backend     → Node.js + Express API and Mongoose models
```

---

## <a id="contributing"></a>🤝 Contributing

This is a university project, and we are not accepting external contributions at the moment.
Only team members involved in the coursework are allowed to make changes.

---

## <a id="license"></a>📄 License

This project is licensed under the MIT License.



