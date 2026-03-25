# Broken / Unverified Buttons List

This list tracks all interactive elements that are currently mapped but not fully verified against the backend/database instructions. A "Broken" button here means it has not been confirmed to follow all rules (Route=/api/..., Permission enforced, DB hardened, Logging active).

| Ref | Label | Route/API | Missing/To-Verify |
|---|---|---|---|
| DASH-1 | Header: Refresh | `/api/dashboard/stats` | Verify API, DB query, Permissions, Logging |
| DASH-2 | Widget: Retry | `/api/dashboard/stats` | Verify API, DB query, Permissions, Logging |
| USR-1 | Header: Fetch Replies | `/api/email-replies/fetch` | Implement Endpoint, Permissions, Logging |
| USR-2 | Header: Refresh | `/api/users` | Verify API, Indexes, Permissions |
| USR-8 | Create: Submit | `/api/users` | Verify Validation, Unique Constraint, Permissions |
| USR-9 | Detail: Approve | `/api/users/:id/approve` | Verify API logic, Permissions (users.verify) |
| USR-10 | Detail: Delete | `/api/users/:id` | Verify Logic, Soft/Hard Delete, Permissions |
| USR-12 | Edit: Submit | `/api/users/:id` | Verify Validation, Permissions |
| MEM-1 | Header: Refresh | `/api/memberships` | Verify API, DB Indexes, Permissions |
| MEM-5 | Create: Search User | `/api/users` | Verify search query efficiency |
| MEM-6 | Create: Get Packages | `/api/memberships/packages` | Endpoint likely missing, need to implement |
| MEM-7 | Create: Submit | `/api/memberships` | Verify transactions, validation, permissions |
| MEM-9 | Detail: Cancel | `/api/memberships/:id/cancel` | Verify logic, permissions |
| MEM-10 | Edit: Submit | `/api/memberships/:id` | Verify logic, permissions |
| ACT-1 | Header: Refresh | `/api/activities` | Verify API, DB |
| ACT-6 | Create: Submit | `/api/activities` | Verify Validation, Permissions |
| ACT-7 | Detail: Register | `/api/activities/:id/register` | Verify logic, race conditions, permissions |
| ACT-8 | Detail: Cancel Reg | `/api/activities/:id/register` | Verify logic, permissions |
| ACT-9 | Edit: Delete | `/api/activities/:id` | Verify logic, permissions |
| ACT-10 | Edit: Submit | `/api/activities/:id` | Verify validation, permissions |
| REP-1 | Header: Refresh | `/api/reports/stats` | Verify Aggregation queries, performance |
| SET-1 | Profile: Save | `/api/profile` | Verify endpoint |
| SET-2 | Pass: Save | `/api/profile/password` | Verify endpoint |
| SET-3 | Brand: Upload | `updateLogo` | Verify multipart handling, permissions |
| SET-4 | Brand: Save | `saveBranding` | Verify settings storage (v2 concept) |
| SET-5 | System: Save | `/api/settings/system` | Verify settings storage (v2 concept) |
| AUTH-1 | Login: Submit | `/api/auth/login` | Verify rate limiting, logging |
| AUTH-3 | Reg: Send OTP | `authService.sendOtp` | Verify Service integration |
| AUTH-4 | Reg: Verify OTP | `authService.verifyOtp` | Verify Service integration |
| AUTH-5 | Reg: Submit | `/api/auth/register` | Verify duplicate checks, unique constraints |

**Next Step:** Proceed to Deliverable 3 (SQL Migrations) to fix the DB side of these issues.
