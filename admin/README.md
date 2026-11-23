# THAMIZARA Admin

Separate React + Vite admin application for the simplified enquiry model.
Manages demo requests and general enquiries submitted through the public
website — no CRM, quotations or project management.

## Setup

```bash
cd admin
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev            # http://localhost:5174
```

## Pages

| Route | Purpose |
|---|---|
| `/login` | Staff sign-in (JWT against `POST /api/v1/auth/login`) |
| `/` | Dashboard — submission counts |
| `/demo-requests` | DEMO_REQUEST list (search, status, country filters) |
| `/enquiries` | GENERAL_ENQUIRY list |
| `/submissions/:id` | Detail + status workflow + copy email/phone |

## Backend endpoints used

- `POST /api/v1/auth/login`
- `GET /api/v1/admin/submissions`, `/stats`, `/:id`
- `PATCH /api/v1/admin/submissions/:id/status`

Requires a user account with `leads.read` / `leads.update` (SUPER_ADMIN,
ADMIN or SALES_MANAGER). Create the first admin with
`npm run seed:admin` inside `backend/`.

## Production build

```bash
npm run build   # → dist/ — serve behind Nginx at e.g. admin.thamizara.com
```
