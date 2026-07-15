# PDF Portal — Full Stack (React + Node.js + MySQL + JWT)

A complete role-based PDF management app:

- **Admin** logs in → uploads PDF files.
- **User** logs in → browses and reads (views) the uploaded PDFs.
- Authentication is done end-to-end with **JWT** (login, protected routes, logout with token blacklist).
- Frontend styled with **Tailwind CSS**.

---

## 📁 Project Structure

```
pdf-portal/
├── backend/                 Node.js + Express + MySQL API
│   ├── config/db.js         MySQL connection pool
│   ├── controllers/         Auth & PDF business logic
│   ├── middleware/          JWT auth guard, admin guard, multer upload
│   ├── routes/               /api/auth, /api/pdfs
│   ├── uploads/              Uploaded PDF files are stored here
│   ├── schema.sql            MySQL schema (users, pdfs, token_blacklist)
│   ├── seedAdmin.js          Script to create the default admin account
│   ├── server.js             App entry point
│   └── .env.example
│
└── frontend/                 React (Vite) + Tailwind CSS
    ├── src/
    │   ├── api/axios.js       Axios instance, auto-attaches JWT
    │   ├── context/AuthContext.jsx   Global auth state (login/register/logout)
    │   ├── components/        Navbar, ProtectedRoute
    │   ├── pages/              Login, Register, AdminDashboard, UserDashboard, PdfViewer
    │   └── App.jsx             Routes (role-based)
    └── .env.example
```

---

## ⚙️ 1. Backend Setup

### Requirements
- Node.js 18+
- MySQL 8+ (or MariaDB)

### Steps

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials and a strong `JWT_SECRET`:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pdf_portal
DB_PORT=3306
JWT_SECRET=change_this_to_a_long_random_secret_key
JWT_EXPIRES_IN=1d
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

Create the database & tables:

```bash
mysql -u root -p < schema.sql
```

Seed the default admin account (reads credentials from `.env`):

```bash
node seedAdmin.js
```

Start the API server:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

The API runs at **http://localhost:5000**. Test it: `GET http://localhost:5000/api/health`.

---

## 💻 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

---

## 🔑 3. Using the App

1. Go to `http://localhost:3000` → redirected to **Login**.
2. **Admin login**: use the seeded admin credentials (default `admin@example.com` / `Admin@123`, or whatever you set in `.env`).
   - Admin is redirected to `/admin` → can **upload PDFs** (title + file) and see/delete the list of uploaded PDFs.
3. **User registration**: click "Register here" to create a normal user account.
   - User is redirected to `/dashboard` → sees a **read-only library** of PDFs uploaded by the admin, and can open any of them in an in-app viewer (`/view/:id`).
4. **Logout**: click Logout in the navbar. This calls `/api/auth/logout`, which blacklists the current JWT server-side (so the same token can't be reused even if intercepted) and clears it from the browser.

### Role-based behavior
| Role  | Can upload PDFs | Can view PDFs | Landing page |
|-------|------------------|----------------|---------------|
| admin | ✅ Yes | ✅ Yes | `/admin` |
| user  | ❌ No  | ✅ Yes | `/dashboard` |

---

## 🔒 How JWT Auth Works Here

1. **Login/Register** → backend verifies credentials (bcrypt-hashed passwords) → issues a signed JWT containing `{ id, name, email, role }`.
2. Frontend stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every API request (via an Axios interceptor).
3. Backend middleware (`authenticateToken`) verifies the token signature/expiry on every protected route, and also checks a `token_blacklist` table so **logged-out tokens can never be reused**.
4. `authorizeAdmin` middleware further restricts PDF upload/delete routes to admin-only.
5. **Logout** inserts the current token into `token_blacklist` (server-side revocation) and clears local storage (client-side cleanup) — a complete login-to-logout cycle.

---

## 📡 API Reference

| Method | Endpoint              | Access        | Description                       |
|--------|-----------------------|---------------|------------------------------------|
| POST   | `/api/auth/register`  | Public        | Register a new user (role=user)   |
| POST   | `/api/auth/login`     | Public        | Login (admin or user)             |
| POST   | `/api/auth/logout`    | Authenticated | Blacklist current token           |
| GET    | `/api/auth/me`        | Authenticated | Get current logged-in user        |
| GET    | `/api/pdfs`           | Authenticated | List all PDFs                     |
| GET    | `/api/pdfs/view/:id`  | Authenticated | Stream a PDF file inline          |
| POST   | `/api/pdfs/upload`    | Admin only    | Upload a new PDF (`multipart/form-data`, field `pdf`) |
| DELETE | `/api/pdfs/:id`       | Admin only    | Delete a PDF                      |

---

## 🛠️ Notes & Production Tips

- Change `JWT_SECRET` and the default admin password before deploying.
- `uploads/` currently stores files on local disk — for production, consider S3 or another object store.
- CORS is open (`cors()`); restrict `origin` to your frontend domain in production.
- Consider adding HTTPS, rate-limiting, and refresh tokens for a production-grade deployment.
