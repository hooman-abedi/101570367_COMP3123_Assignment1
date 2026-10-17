# COMP 3123 – Assignment 1: Secure Employee Management REST API

**Student:** Hooman Abedi (101570367)
**Course:** COMP 3123 – Full Stack Development I

## 1. Project

### Purpose
A secure RESTful backend API where users can sign up, log in, and manage **their own** employees.
Each employee belongs to the user who created it, and a user can never see or change another user's employees.

### Technologies
| Area | Technology |
|---|---|
| Runtime / framework | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`), password hashing (`bcryptjs`) |
| Security | Helmet, `express-rate-limit`, `express-validator` |
| Logging | Winston (app logs), Morgan (HTTP request logs) |
| Config | `dotenv` |
| Testing | Postman |

### Project structure
```
src/
├── app.js                  # Express app: middleware, routes, health check, error handling
├── server.js               # Entry point: connects to DB, starts server
├── config/
│   ├── env.js              # Loads and checks environment variables
│   └── db.js               # MongoDB connection (database: comp3123_assignment1)
├── models/
│   ├── User.js             # User schema, password hashing
│   └── Employee.js         # Employee schema with `user` owner reference
├── middleware/
│   ├── auth.js             # JWT verification
│   ├── validate.js         # Turns validation errors into 400 responses
│   ├── rateLimiter.js      # Auth + general API rate limits
│   └── errorHandler.js     # 404 handler + centralized error handler
├── validators/             # express-validator rules for users and employees
├── services/               # Business logic (login, JWT creation, ownership checks)
├── controllers/            # Request/response handling
├── routes/                 # Express Routers for /api/v1/user and /api/v1/emp
└── utils/
    ├── logger.js           # Winston logger (writes to logs/)
    └── AppError.js         # Error class carrying an HTTP status code
logs/                       # Local log files (sample.log committed)
postman/                    # Exported Postman collection
```

## 2. Installation

1. **Clone the repository**
```bash
   git clone https://github.com/hooman-abedi/101570367_COMP3123_Assignment1.git
   cd 101570367_COMP3123_Assignment1
```
2. **Install dependencies**
```bash
   npm install
```
3. **Configure environment variables**
```bash
   cp .env.example .env
```
   Then fill in the values in `.env` (see Configuration below).
4. **Start MongoDB.** This project uses **MongoDB Atlas**: create a free cluster, create a database user,
   allow your IP under *Network Access*, and paste the connection string into `MONGODB_URI`.
   (A local MongoDB at `mongodb://127.0.0.1:27017/comp3123_assignment1` also works.)
5. **Start the application**
```bash
   npm run dev     # development (auto-restart with nodemon)
   npm start       # normal start
```
   Expected output:
```
   Connected to MongoDB database: comp3123_assignment1
   Server started on port 3000
```
6. **Test the API.** Import `postman/COMP3123 Assignment 1.postman_collection.json` into Postman.
   The collection uses the variables `baseUrl`, `tokenA`, `tokenB`, `empA` and `empB`. Login and create requests save tokens and IDs automatically.

## 3. Configuration

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<username>:<password>@<cluster>/comp3123_assignment1` |
| `JWT_SECRET` | Long random secret used to sign JWTs | *(generate your own)* |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |

Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
The real `.env` file is listed in `.gitignore` and is **never committed**.

## 4. API Endpoints

Base URL: `http://localhost:3000`

| # | Method | Endpoint | Auth | Success | Purpose |
|---|---|---|---|---|---|
| 1 | POST | `/api/v1/user/signup` | No | 201 | Register a new user |
| 2 | POST | `/api/v1/user/login` | No | 200 | Log in (username **or** email) and receive a JWT |
| 3 | GET | `/api/v1/emp/employees` | Yes | 200 | List the logged-in user's employees |
| 4 | POST | `/api/v1/emp/employees` | Yes | 201 | Create an employee owned by the logged-in user |
| 5 | GET | `/api/v1/emp/employees/{eid}` | Yes | 200 | Get one of the user's employees |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | Yes | 200 | Update one of the user's employees |
| 7 | DELETE | `/api/v1/emp/employees?eid=xxx` | Yes | 204 | Delete one of the user's employees |
| – | GET | `/health` | No | 200 | Health check |

### Sample requests
**Signup**
```json
{ "username": "userA", "email": "usera@example.com", "password": "Password123" }
```
**Login** (either form)
```json
{ "username": "userA", "password": "Password123" }
{ "email": "usera@example.com", "password": "Password123" }
```
**Login response**
```json
{ "message": "Login successful", "token": "eyJhbGciOi...", "user": { "_id": "...", "username": "userA", "email": "usera@example.com" } }
```
**Create / update employee**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "position": "Developer",
  "salary": 75000,
  "date_of_joining": "2026-01-15",
  "department": "Engineering"
}
```
For PUT, any subset of these fields can be sent.

### Error response format
All errors return JSON in the same shape:
```json
{ "status": false, "message": "Validation failed", "errors": [ { "field": "salary", "message": "salary must be a positive number" } ] }
```

### Status codes used
| Code | When |
|---|---|
| 200 OK | Successful login, read, or update |
| 201 Created | User or employee created |
| 204 No Content | Employee deleted (no body) |
| 400 Bad Request | Validation failure, invalid ObjectId, malformed JSON |
| 401 Unauthorized | Missing, invalid, or expired JWT; wrong login credentials |
| 403 Forbidden | Authenticated, but the employee belongs to another user |
| 404 Not Found | Employee does not exist, or unknown route |
| 409 Conflict | Username or email already exists |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unexpected server error (details hidden in production) |

## 5. Authentication

1. **Signup.** The user registers with a username, email and password. The password is hashed before saving.
2. **Login.** The user sends username + password **or** email + password. If the credentials match, the server returns a **JWT**.
   Wrong username and wrong password return the same message, so attackers can't discover which usernames exist.
3. **JWT.** The token is signed with `JWT_SECRET` and contains the user's ID (`sub`). It expires after `JWT_EXPIRES_IN` (1 hour).
   The token is signed, not encrypted, so it contains no sensitive data.
4. **Authorization header.** The client sends the token on every employee request:
```
   Authorization: Bearer <jwt>
```
5. **Protected endpoints.** All `/api/v1/emp/*` routes go through the `auth.js` middleware, which:
   - rejects a missing token → 401 `Authentication token missing`
   - rejects an invalid or tampered token → 401 `Invalid token`
   - rejects an expired token → 401 `Token expired`
   - checks that the user in the token still exists
   - attaches the user's ID to `req.user`

## 6. Authorization (employee ownership)

**Rule: a user can only access employees they created.**

- Each employee document has a `user` field (an ObjectId referencing `User`), which records its owner.
- When an employee is created, the owner is taken from `req.user.id`, **which comes from the verified JWT and never from the request body**.
  Sending a `user` field in the body is rejected with 400.
- **List:** `Employee.find({ user: req.user.id })` returns only the user's own employees.
- **Get / update / delete:** the service loads the employee and compares its `user` field with the logged-in user:
  - the employee doesn't exist → **404**
  - it belongs to someone else → **403** (also logged as an authorization failure)
- Update and delete queries also filter by `{ _id: eid, user: req.user.id }`, so changing the `eid` in the URL or query string can never reach another user's data.

**Tested with two users:** User A and User B each created employees. Every attempt by A to get, update or delete B's employee (and the reverse) returned **403**, and the data stayed unchanged. See the screenshots and the `6 Ownership Tests` folder in the Postman collection.

## 7. Security

| Feature | How it's used |
|---|---|
| **Password hashing** | `bcryptjs` with cost factor 12, in a Mongoose `pre('save')` hook. Passwords are stored as `$2b$12$...` hashes, are excluded from queries (`select: false`), and are removed from every JSON response. |
| **JWT** | Stateless authentication with an expiry time. Signed with a secret from the environment. |
| **Helmet** | Adds HTTP security headers such as `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` and `X-Frame-Options`, and removes `X-Powered-By`. This protects against clickjacking, MIME sniffing and some XSS attacks. |
| **Rate limiting** | Limits how many requests one IP can make in a time window, which slows down brute-force password guessing and abuse. See below. |
| **Input validation** | `express-validator` checks required fields, string lengths, email format, positive numeric salary, valid ISO dates and valid MongoDB ObjectIds. Request bodies are limited to 10 KB. Only validated fields are passed to the database. |
| **Environment variables** | Secrets (`MONGODB_URI`, `JWT_SECRET`) live in `.env`, which is git-ignored. `.env.example` documents them without real values. The app refuses to start if required variables are missing. |

### Rate limiting
**What it is:** a cap on how many requests a client (IP address) can send within a time window.

| Limiter | Endpoints | Limit |
|---|---|---|
| Auth limiter | `POST /api/v1/user/signup`, `POST /api/v1/user/login` (shared counter) | 5 requests / 15 minutes per IP |
| General API limiter | All `/api/*` routes | 100 requests / 15 minutes per IP |

**When the limit is exceeded,** the API responds with **429 Too Many Requests**:
```json
{ "status": false, "message": "Too many authentication attempts, please try again in 15 minutes" }
```
It also sends `RateLimit` headers, and the event is logged as `Rate limit exceeded`.
**Tested:** the 6th login attempt within 15 minutes returned 429 (see screenshot).

## 8. Logging

- **Where:** `logs/app.log` (all logs) and `logs/error.log` (errors only), plus the console. Real log files are git-ignored. `logs/sample.log` is a committed example.
- **Format:** JSON lines, each with `level`, `message` and `timestamp`.
- **What is logged:**
  - server startup and database connection
  - every HTTP request: method, path, status code, response time
  - signups and successful/failed logins
  - validation failures (which fields failed)
  - authentication failures (missing, invalid or expired token)
  - authorization failures (user X tried to access employee Y)
  - rate-limit violations
  - server errors (500)
- **Intentionally excluded:** passwords, JWT tokens, the JWT secret, database credentials and request bodies.

## 9. Health Check

`GET /health`

```json
{
  "status": "ok",
  "uptime_seconds": 642,
  "timestamp": "2026-10-17T05:33:03.918Z",
  "database": "connected"
}
```
Returns **200** when the server is running and the database is connected, or **503** with `"status": "degraded"` if the database is not connected.

## 10. Testing

All endpoints were tested in Postman (collection in `postman/`), covering success and failure cases:
- signup (valid, duplicate username/email, invalid email/password, missing fields)
- login (username, email, wrong password, missing credentials, rate limit)
- employee CRUD (create, list, get, update, delete)
- validation errors, missing/invalid/expired JWT, invalid ID, non-existent employee, malformed JSON, unknown route
- two-user ownership tests (all cross-user access returns 403)

Screenshots are included with the submission.

## 11. Test Credentials (non-sensitive, for marking)

| User | Username | Email | Password |
|---|---|---|---|
| User A | `userA` | `usera@example.com` | `Password123` |
| User B | `userB` | `userb@example.com` | `Password123` |