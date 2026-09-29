# BlogSphere — Write. Share. Connect.

BlogSphere is a professional MERN blogging platform built for full-stack internship demonstration. It combines content management with real user interaction: authentication, blog CRUD, drafts, comments/replies, likes, bookmarks, search, categories, public author profiles, notifications, moderation reports, author analytics and an admin dashboard.

## Tech stack
React + Vite + React Router + Axios · Node.js + Express · MongoDB + Mongoose · JWT + bcryptjs · Helmet + CORS

## Core features
- JWT registration/login/logout with bcrypt password hashing
- User and Admin role-based authorization enforced on the backend
- Create, edit, delete, draft and publish blog posts
- Automatic slug, word count and reading time
- Categories, tags, search, sorting and backend pagination
- Post likes and bookmarks with duplicate prevention
- Nested comments/replies and comment likes
- Report posts/comments for moderation
- Public author profiles and profile/password management
- In-app notifications for comments, replies and likes
- Author analytics for posts, views, likes and comments
- Admin dashboard for users, posts, comments, categories and reports
- Dark/light theme with persistence
- Reading progress, related articles and browser sharing
- Responsive desktop/tablet/mobile UI
- Loading, empty, error and confirmation states

## Setup
1. Install Node.js 18+ and MongoDB locally, or create a MongoDB Atlas cluster.
2. Backend:
   ```text
   cd backend
   npm install
   ```
   Copy `backend/.env.example` to `backend/.env` and set your MongoDB URI and JWT secret.
   Then:
   ```text
   npm run seed
   npm run dev
   ```
   Backend runs on `http://localhost:5000`.
3. Frontend (new terminal):
   ```text
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`.

## Local seed accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@blogsphere.com | Admin@123 |
| User | aarav@blogsphere.com | User@1234 |
| User | meera@blogsphere.com | User@1234 |
| User | rohan@blogsphere.com | User@1234 |

Change or replace development credentials before production deployment.

## Environment variables
Backend:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Frontend:
- `VITE_API_URL`

Never commit real `.env` files or secrets. Only `.env.example` files belong in GitHub.

## API summary
- Auth: `/api/auth/*`
- Users/profiles: `/api/users/*`
- Posts: `/api/posts/*`
- Comments: `/api/posts/:id/comments` and `/api/comments/*`
- Categories: `/api/categories/*`
- Notifications: `/api/notifications/*`
- Reports: `/api/reports/*`
- Analytics: `/api/analytics/me`
- Admin: `/api/admin/*`
- Health: `/api/health`

## Security
Password hashing, JWT expiry, backend role authorization, ownership checks, suspended-user blocking, input validation, NoSQL-injection key stripping, regex escaping for search, Helmet, CORS allow-list and safe plain-text post rendering are included.

## Deployment
### Backend
Deploy `backend` to Render/Railway. Set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the hosting dashboard. Use `npm install` as build command and `npm start` as start command.

### Frontend
Deploy `frontend` to Vercel/Netlify/Render. Build with `npm install && npm run build`, publish `dist`, and set `VITE_API_URL` to the deployed backend API URL. Configure the host to rewrite SPA routes to `/index.html`.

## Testing checklist
- Register/login/logout
- Protected routes and Admin authorization
- Create/edit/delete/draft/publish posts
- Search/filter/sort/pagination
- Like/unlike and bookmark/unbookmark
- Add/edit/delete/reply/like/report comments
- Report and moderate posts/comments as Admin
- View and edit public profile
- Change password
- Read/mark notifications
- View author analytics
- Admin users/posts/comments/categories/reports
- Test desktop, tablet and mobile layouts
- Refresh pages and verify MongoDB data persists

## GitHub upload
```text
cd BlogSphere
git init
git add .
git commit -m "Build BlogSphere full-stack blogging platform"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
