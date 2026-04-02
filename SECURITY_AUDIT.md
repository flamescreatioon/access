# Security Audit and Bug Report

## 1. Critical Vulnerabilities

### 1.1 Privilege Escalation in Registration
**File:** `backend/controllers/authController.js`
**Description:** The `register` function directly uses the `role` field from `req.body` without validation. Since the `/register` endpoint is public, an attacker can register with administrative privileges by including `"role": "Admin"` in the request body.
**Recommendation:** Explicitly ignore or sanitize the `role` field in the public registration endpoint. Force it to a default value (e.g., 'Member').

### 1.2 Improper Role Authorization in Bookings
**File:** `backend/routes/bookings.js`
**Description:** The route protection for admin endpoints uses `authorizeRole` incorrectly:
```javascript
router.get('/admin/all', authorizeRole('Admin', 'Hub Manager'), bookingController.getAllBookings);
```
The `authorizeRole` middleware expects an array of roles. By passing separate arguments, only `'Admin'` is checked, and `'Hub Manager'` is ignored. This unintendedly blocks Hub Managers.
**Recommendation:** Change to `authorizeRole(['Admin', 'Hub Manager'])`.

## 2. Major Issues

### 2.1 Race Conditions in Booking System
**Files:** `backend/controllers/bookingController.js`, `backend/controllers/equipmentController.js`
**Description:** The booking logic attempts to prevent double-booking using a transaction and `lock: true` on a `findOne` query.
```javascript
const conflict = await Booking.findOne({ ..., lock: true, transaction: t });
```
However, if no conflicting booking exists, `findOne` returns `null`, and *nothing is locked*. Two concurrent requests can both receive `null`, proceed to create a booking, and overlap.
**Recommendation:** Use a table-level lock (e.g., locking the parent `Space` or `Equipment` row with `lock: true`) or database constraints (e.g., PostgreSQL `EXCLUDE` constraints) to ensure exclusivity.

### 2.2 Potential Object Injection in Query Parameters
**File:** `backend/controllers/bookingController.js`
**Description:** In `getUserBookings`, `req.query.status` is directly assigned to the `where` clause:
```javascript
if (status) where.status = status;
```
If an attacker passes an object (e.g., `?status[Op.ne]=confirmed`), it could alter the query logic to bypass status filters.
**Recommendation:** Explicitly validate and sanitize `req.query` parameters. Ensure `status` is a string.

## 3. Minor Issues & Best Practices

### 3.1 Weak Password Policy
**File:** `backend/controllers/authController.js`
**Description:** There is no enforcement of password complexity or minimum length during registration or password updates.
**Recommendation:** Implement password strength validation (e.g., minimum 8 characters, mix of case/numbers).

### 3.2 Token Storage Security
**File:** `backend/controllers/authController.js`
**Description:** Refresh tokens are returned in the JSON response body. This makes them vulnerable to XSS attacks if stored in `localStorage` by the frontend.
**Recommendation:** Return refresh tokens as `httpOnly` cookies.

### 3.3 Improper Error Handling in Scan Validation
**File:** `backend/controllers/scanController.js`
**Description:** The `validateScan` function returns a valid JSON response even for denied scans, relying on the client to respect the `status: 'DENIED'`. While the `logDecision` endpoint enforces checks, this logic is fragile if the client code is modified.
**Recommendation:** Ensure critical access decisions are enforced server-side and not just communicated via status flags.

### 3.4 Inconsistent Authorization Middleware Usage
**Files:** Various route files.
**Description:** Inconsistent usage of `authorizeRole` (passing strings vs arrays) led to the bug in `bookings.js`.
**Recommendation:** Standardize usage and consider adding validation in the middleware to throw an error if `roles` is not an array.
