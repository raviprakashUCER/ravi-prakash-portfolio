# Ravi Prakash - Personal Portfolio Website

A clean, modern, and reliable personal portfolio website built with a decoupled architecture:
- **Frontend**: React (Vite) hosted on **Vercel**
- **Backend**: Express.js hosted on **Render**
- **Database**: SQLite with WAL mode on persistent disk
- **Storage**: Single canonical persistent disk storage with `GET /api/media/:filename`

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Vercel (Frontend)      │
                          │   React + Vite SPA       │
                          └─────────────┬────────────┘
                                        │ Direct API Calls
                                        │ (VITE_API_URL)
                                        ▼
                          ┌──────────────────────────┐
                          │    Render (Backend)      │
                          │    Express.js REST API   │
                          └──────┬─────────────┬─────┘
                                 │             │
                ┌────────────────┴────┐   ┌────┴────────────────┐
                │ SQLite Database     │   │ Persistent Disk     │
                │ /var/data/database  │   │ /var/data/uploads   │
                └─────────────────────┘   └─────────────────────┘
```

---

## 1. Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Step 1: Start Backend
```bash
cd server
npm install

# Start development server (defaults to port 5000)
npm run dev
```

The backend will initialize `database.sqlite` and an `uploads/` folder automatically.

### Step 2: Start Frontend
```bash
cd ../client
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 2. Environment Variables

### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:

| Variable | Description | Example (Local) | Example (Render Production) |
|---|---|---|---|
| `PORT` | Port for Express server | `5000` | `10000` |
| `DATABASE_PATH` | SQLite file location | `./database.sqlite` | `/var/data/database.sqlite` |
| `UPLOAD_DIR` | Persistent folder for files | `./uploads` | `/var/data/uploads` |
| `FRONTEND_URL` | Vercel production domain for CORS | `http://localhost:5173` | `https://your-portfolio.vercel.app` |
| `ADMIN_USERNAME` | Admin login username | `admin` | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `admin123` | `your_secure_password` |
| `JWT_SECRET` | Secret key for JWT signing | `secret_dev_key` | `long_random_secure_secret` |

### Frontend (`client/.env`)
Create `client/.env` based on `client/.env.example`:

| Variable | Description | Example (Local) | Example (Vercel Production) |
|---|---|---|---|
| `VITE_API_URL` | Backend Render API base URL | `http://localhost:5000` | `https://your-backend.onrender.com` |

---

## 3. Backend Deployment to Render

1. Create a new **Web Service** on [Render Dashboard](https://dashboard.render.com).
2. Connect your Git repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set the Environment Variables:
   - `PORT`: `10000`
   - `DATABASE_PATH`: `/var/data/database.sqlite`
   - `UPLOAD_DIR`: `/var/data/uploads`
   - `FRONTEND_URL`: `https://your-portfolio.vercel.app`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `<your-strong-password>`
   - `JWT_SECRET`: `<your-jwt-secret>`

### Render Persistent Disk Setup
To persist your SQLite database and all uploaded files (resumes, notes, photos):
1. In your Render Web Service settings, navigate to **Disks**.
2. Click **Add Disks** / **Attach Disk**.
3. Set:
   - **Name**: `portfolio-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (or larger depending on your needs).
4. Save and deploy.

---

## 4. Frontend Deployment to Vercel

1. Import your Git repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client`.
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com` (your deployed Render URL, without trailing slash).
4. Click **Deploy**.

---

## 5. Admin Portal & Management

### Admin Login
1. Click the **Admin** button in the top right navbar or in the footer.
2. Enter your `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
3. Upon authentication, a 7-day secure JWT token is stored in `localStorage`, granting access to the **Portfolio Admin Center**.

### How to Upload/Update Profile Photo
1. Open Admin Panel -> **Profile** tab.
2. Click **Choose & Upload Photo** and select an image (`.jpg`, `.jpeg`, `.png`, `.webp`).
3. The image is uploaded to `/api/admin/upload`, saved to the persistent disk, and returns a canonical URL (`/api/media/filename.jpg`).
4. Click **Save Profile Changes**.

### How to Upload/Replace Resume
1. Open Admin Panel -> **Resume PDF** tab.
2. Click **Upload Resume PDF** (or **Upload New / Replace Resume PDF**).
3. Select your `.pdf` file.
4. The system automatically uploads the file, records its metadata in SQLite, cleans up any previous file on disk, and sets it as the active resume.
5. On the public website, visitors can click **View Full Screen** or **Download Resume**.

### How to Upload Notes & Attached Study PDFs
1. Open Admin Panel -> **Notes Hub** tab.
2. Click **Create Note**.
3. Fill in Title, Category, Short Description, Tags, and Markdown Content.
4. *(Optional)* Click **Upload Cover** to add a header image.
5. *(Optional)* Click **Upload PDF** to attach a study reference PDF.
6. Click **Save Note**.
7. If a PDF is attached, the public note page will automatically show **View Full PDF** and **Download** buttons. If no PDF is attached, only the clean markdown content is rendered.

---

## 6. Automated Testing & Verification

Run the comprehensive end-to-end verification suite:

```bash
node verify.js
```

This verifies:
- Backend server health
- Public profile, resume, notes, projects, and certificates retrieval
- Admin JWT login & route protection
- Image & PDF uploads via Multer to persistent storage
- Canonical media delivery (`GET /api/media/:filename`) with correct MIME types
- Resume upload, public full screen viewing, and download headers
- Note creation with and without attached study PDFs
- Path traversal prevention security check
