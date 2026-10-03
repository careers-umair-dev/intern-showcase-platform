# 🚀 Intern Showcase Platform (MERN)

A full-stack portfolio platform that enables interns to build, customize, publish, and share professional project portfolios with built-in view analytics and social sharing capabilities.

## 🛠️ Features

* **🔐 Authentication** — Secure JWT + bcrypt authentication with Google Sign-In using verified Google ID tokens.
* **👤 Profile & Account Management** — Manage profile information, account settings, and password updates.
* **📁 Project Management** — Full project CRUD with duplicate, feature, search, tag filtering, sorting, and drag-and-drop reordering.
* **🖼️ Image Uploads** — Upload project and portfolio images in PNG, JPG, WEBP, or GIF format with a maximum file size of 3 MB.
* **🎨 Portfolio Editor** — Customize portfolio content with a **live preview**, three available templates, accent colors, light/dark mode, and configurable section visibility.
* **🌐 Publishing Controls** — Switch portfolios between public and private states and publish changes when ready.
* **🔗 Portfolio Sharing** — Share portfolios through a dedicated dialog with copy-link, LinkedIn, WhatsApp, X, Facebook, and QR-code options.
* **📊 Analytics Dashboard** — View overall statistics, a 14-day views chart, top-performing projects, and recent activity without storing visitor identities.
* **🔍 SEO & Social Metadata** — Dynamic page titles, Open Graph metadata, and Twitter card metadata for improved link previews.
* **⚡ Server-Rendered Sharing** — `/share/:username` provides server-rendered Open Graph pages so shared portfolio links display correctly across supported platforms.

## ⚙️ Setup

### 1. 📋 Prerequisites

Install Node.js 18+ and MongoDB. You can use a local MongoDB instance (`mongod`) or a MongoDB Atlas connection string.

### 2. 🔧 Configure Environment Variables

Copy `.env.example` to `backend/.env`:

**PowerShell**

```powershell
Copy-Item .env.example backend/.env
```

**Unix / macOS**

```bash
cp .env.example backend/.env
```

Set `MONGO_URI` and replace `JWT_SECRET` with a unique random value of at least 32 characters.

Generate a secure secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 🖥️ Install & Run the Backend

```bash
Set-Location backend
npm install
npm run dev
```

The API runs on port `5000`.

### 4. 💻 Install & Run the Frontend

In a separate terminal:

```bash
Set-Location frontend
npm install
npm run dev
```

The frontend runs on port `5173`.

## 🔑 Environment Variables

The backend uses the following environment variables:

```env
PORT
MONGO_URI
JWT_SECRET
CLIENT_URL
GOOGLE_CLIENT_ID
```

## 🔵 Google Sign-In

### 1. ☁️ Create Google OAuth Credentials

Open Google Cloud Console, configure the OAuth consent screen, and create an OAuth client with the application type **Web application**.

### 2. 🌍 Configure Authorized Origins

Add the following under **Authorized JavaScript origins**:

```text
http://localhost:5173
```

Also add your production frontend origin when deploying.

This implementation uses Google Identity Services ID tokens and does not require an OAuth client secret or redirect URI.

### 3. 🔐 Configure the Client ID

Add the Web client ID to `GOOGLE_CLIENT_ID` in:

```text
backend/.env
```

Restart the backend after updating the environment variable. The frontend retrieves the public client ID through:

```text
/api/auth/google/config
```

### 4. ✅ Sign-In Flow

The **Continue with Google** option is available on both login and registration.

New users receive a new account with a private portfolio. If a verified Google email matches an existing account, Google Sign-In is linked to that account.

### 5. 🛡️ Content Security Policy

If your production frontend uses a Content Security Policy, allow:

```text
https://accounts.google.com/gsi/client
```

in `script-src`, and:

```text
https://accounts.google.com/gsi/
```

in both `frame-src` and `connect-src`.

## 🔌 API

```text
/api/auth/{register,login,google,google/config,me,password}
/api/projects
/api/projects/:id
/api/projects/:id/duplicate
/api/portfolio
/api/themes
/api/upload
/api/stats
/api/public/:username
/api/public/:username/projects/:id
/share/:username
```

The `/api/themes` endpoint provides seeded theme presets backed by the `PortfolioTheme` model.

## 📜 Scripts

**Backend**

```text
dev
start
```

**Frontend**

```text
dev
build
```

## 🚀 Usage

1. **📝 Register** or sign in to your account.
2. **👤 Complete your profile** details and account settings from **Profile**.
3. **🎨 Customize your portfolio** hero section and visual design through the **Portfolio Editor**.
4. **📂 Add projects** and set their status to **Published**.
5. **✨ Select a theme** for your portfolio.
6. **🌐 Publish** your portfolio.
7. **🔗 Share** your portfolio using:

```text
/portfolio/<username>
```

## 📝 Notes

Project and portfolio uploads are stored locally under:

```text
backend/uploads
```

For production deployments, replace the default `multer` local-disk storage with a persistent object-storage solution such as S3 or Cloudinary using the appropriate environment credentials.

Social sharing uses:

```text
/share/<username>
```

This allows crawlers to access server-rendered Open Graph metadata for link previews.

In production, route `/share` to the backend in the same way as `/api` and `/uploads`.

## 📂 Project Structure

```text
backend/
├── controllers/       Request handlers
├── services/          Business logic
├── routes/            API routes
├── middleware/        Authentication, validation, and uploads
├── models/            MongoDB/Mongoose models
└── uploads/           Uploaded media

frontend/src/
├── components/        Reusable UI components
├── pages/             Application pages
├── context/           React context
├── services/          API services
└── styles.css         Global styles
```

## 🔒 Security

* 🔐 JWT-based authentication with protected routes.
* 🔑 Passwords securely hashed using **bcrypt**.
* 🔵 Google ID-token signature, audience, and email verification.
* 👤 Ownership checks across project and portfolio operations.
* 🛡️ Request input validation and `$`-operator sanitization.
* 🪖 Helmet security headers.
* 🚦 Rate limiting applied to `/api/auth`.
* 🖼️ Image type and file-size validation.
* 🌐 CORS restricted to the configured `CLIENT_URL`.
* 🚫 `.env` files and uploaded media should remain excluded from version control.
* 🗺️ Sitemap available at:

```text
/sitemap.xml
```

on the API host.

---

<p align="center">
  <strong> Built with ❤️ by Umair Ansari</strong>
</p>
