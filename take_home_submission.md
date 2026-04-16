# Military Asset Management System - Submission

## 1. Project Overview
**Description:** A full-stack military asset management platform built to enforce Role-Based Access Control (RBAC) over the procurement, transfer, assignment, and expenditure of critical sector assets.
**Assumptions:** Uses a Node.js/Express backend, React.js frontend, and a MongoDB Atlas database. The system assumes a minimum of three distinct operational roles.
**Limitations:** Current implementation tracks aggregate quantities per asset logic (for simple bulk item handling), though unique serial tracking could be easily added to the schema.

## 2. Tech Stack & Architecture
*   **Backend:** Node.js & Express. Chosen for its non-blocking I/O paradigm which is excellent for handling rapid, concurrent database transactions required in logistics.
*   **Frontend:** React.js. Chosen for its component-based architecture, allowing for a highly reactive dashboard and modular UI elements. Used Vanilla CSS to enforce a strict, lightweight custom tactical UI theme.
*   **Database:** MongoDB Atlas (NoSQL). Chosen because the document-oriented structure cleanly maps to JavaScript objects, providing massive flexibility when asset types/attributes expand (e.g. adding new telemetry attributes to a Vehicle).

## 3. Data Models / Schema
*   **User:** `[username, password(hashed), role(Enum), baseId]`
*   **Asset:** `[name, equipmentType(Enum), baseId, status(Enum), quantity]`
*   **Transaction:** `[assetId(ref:Asset), transactionType(Enum), fromBase, toBase, assignedTo, date, performedBy(ref:User)]`
    *   *Relationship:* The Transaction schema acts as a permanent ledger linking Users and Assets together to enforce total accountability.

## 4. RBAC Explanation
Roles are enforced primarily via backend JWT Middleware (`verifyToken`, `authorizeRoles`). 
*   **Admin:** Full global access to all sectors and all endpoints.
*   **Logistics Officer:** Access to `Purchases` (creating assets) and `Transfers` (moving cargo).
*   **Base Commander:** Read-only access to their specific `baseId` operations. Allowed to process local `Assignments` and `Expenditures`. Completely blocked from `Purchases` and `Transfers` at the API layer. The UI physically hides the navigation options for these routes if the logged-in token belongs to a Base Commander.

## 5. API Logging
Transaction logging is explicitly enforced by an Append-Only dual-write strategy on the server. Whenever a protected route (like `POST /api/purchases` or `POST /api/transfers`) successfully modifies the `Asset` table, the system immediately instantiates and saves a `Transaction` document. This includes timestamps and the `ObjectId` of the User who authorized it, acting as an immutable Audit Log.

## 6. Setup Instructions
1.  **Backend:** `cd backend`, run `npm install`, ensure `.env` has a valid `MONGO_URI` and `JWT_SECRET`.
2.  **Seed Database (Optional):** Run `npm run seed` to populate default user accounts.
3.  **Run Server:** Run `npm start` (Runs on port 5000).
4.  **Frontend:** `cd frontend`, run `npm install`.
5.  **Run Client:** Run `npm start` (Runs on port 3000).

## 7. API Endpoints (Excerpt)
*   **POST** `/api/auth/login` - Returns JWT token.
*   **GET** `/api/dashboard?base=...&date=...&equipmentType=...` - Returns filtered aggregate metrics.
*   **GET** `/api/transactions` - Returns full audit logs (history queries).
*   **POST** `/api/purchases` - Logs a new asset and generates a purchase transaction.
*   **POST** `/api/transfers` - Updates asset `baseId` and generates a transfer transaction.
*   **POST** `/api/assignments` - Modifies asset status to Assigned/Expended.

## 8. Login Credentials
These accounts have been seeded in the database:
*   **Admin:** `commander` / Password: `password123`
*   **Logistics Officer:** `logistics_pro` / Password: `password123`
*   **Base Commander:** `alpha_lead` / Password: `password123`
