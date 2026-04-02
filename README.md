# Finance Data Processing API

A RESTful backend service for a finance dashboard, built to handle user roles, financial records, and aggregated data summaries. 

This project was built to demonstrate backend architecture, role-based access control (RBAC), and data aggregation using Node.js and PostgreSQL.

## Tech Stack

- **Runtime & Framework:** Node.js, Express, TypeScript
- **Database & ORM:** PostgreSQL, Prisma
- **Validation:** Zod
- **Testing:** Vitest, Supertest
- **API Documentation:** Swagger UI

## Key Features Implemented

- **Role-Based Access Control (RBAC):** Three distinct roles (`VIEWER`, `ANALYST`, `ADMIN`) enforced via custom middleware.
- **Data Aggregation:** Dashboard endpoints that calculate total income, total expenses, net balance, and category-wise breakdowns natively via the database.
- **Records Management:** Full CRUD for financial entries with pagination, search, date-range filtering, and soft deletes.
- **Reliability:** Input validation via Zod, centralized error handling, and rate-limiting.

## Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
PORT=3000
```

### 3. Database Setup
Run Prisma migrations to set up the schema:

```bash
npm run db:migrate
```

### 4. Start the Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`.

## API Documentation
Interactive API documentation is available via Swagger. Once the server is running, navigate to:
`http://localhost:3000/api-docs`

## How to Test Access Control
To simplify testing and focus on the core authorization logic, this API uses header-based mock authentication.

You can test different permission levels by passing the `X-User-Role` header in your requests:

- `X-User-Role: VIEWER` — Can only view the dashboard summary.
- `X-User-Role: ANALYST` — Can view the dashboard, list records, and view specific record details.
- `X-User-Role: ADMIN` — Has full access, including creating/editing/deleting records and managing users.

*(Note: If you use the Swagger UI, there is an "Authorize" button at the top to globally set this header for your requests.)*

## Testing
Unit and integration tests are written using Vitest and Supertest. To run the test suite:

```bash
npm test
```
