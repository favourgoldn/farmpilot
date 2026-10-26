# FarmPilot Security Specification

## 1. Data Invariants

1. **User Identity Invariant**:
   A user document at `/users/{userId}` can only be created or modified by the user with matching `request.auth.uid`. No user may alter their own `role` or `organizationId` after initial creation without administrative authority.

2. **Organization Multi-Tenant Isolation Invariant**:
   All business operational records (farms, fields, crops, expenses, harvests, sales, inventory, tasks, team) reside inside an organization namespace `/organizations/{orgId}/...`.
   Only authenticated users whose profile belongs to `orgId` (or who are recorded in the organization's member list / owner) have read or write access. Users from Organization A can never read, query, list, or write to Organization B.

3. **Financial Accounting Integrity Invariant**:
   Sales and expense records must strictly contain positive financial numbers (`amount >= 0`, `unitPrice >= 0`, `totalAmount >= 0`). Expenses cannot have negative disbursements, preventing balance tampering.

4. **Relational Parent Existence Invariant**:
   Fields cannot exist without a valid parent `farmId`. Crops cannot exist without a valid `fieldId`. Harvests and sales cannot exist without a valid `cropId`.

5. **Temporal & Audit Integrity**:
   `createdAt` must match `request.time` on creation and is immutable during updates. `updatedAt` must be updated to `request.time`.

6. **Customer Credit & Identity Invariant**:
   Customer records must belong to the organization and maintain non-negative credit limits (`creditLimit >= 0`).

7. **Sales Payment Remittance Invariant**:
   Payment remittances must be strictly positive (`amount > 0`) and directly reference a valid sales invoice within the tenant.

8. **Produce Stock Adjustment Invariant**:
   Produce stock adjustments for moisture shrinkage, sorting losses, or internal consumption must record strictly positive physical quantities (`quantity > 0`).

---

## 2. The "Dirty Dozen" Attack Payloads & Test Scenarios

1. **Ghost Org Infiltration (Cross-Tenant Read)**:
   Authenticated User A (Org A) attempts `get` or `list` on `/organizations/org-b/expenses`.
   *Expected: PERMISSION_DENIED.*

2. **Spoofed Author Identity (Identity Theft)**:
   User A creates an expense document setting `createdById: "user-victim-b"`.
   *Expected: PERMISSION_DENIED.*

3. **Negative Expense Injection (Financial Tampering)**:
   Attacker sends an expense write with `amount: -5000000` to fraudulently inflate profit margins.
   *Expected: PERMISSION_DENIED.*

4. **Resource Poisoning (Junk ID)**:
   Attacker targets `/organizations/{orgId}/farms/{farmId}` with a 2KB binary junk string as `farmId`.
   *Expected: PERMISSION_DENIED (rejected by isValidId).*

5. **Privilege Escalation on User Profile**:
   Standard user attempts to update `/users/{userId}` with `{ role: "admin", organizationId: "target-org" }`.
   *Expected: PERMISSION_DENIED.*

6. **Unauthenticated Write**:
   Unauthenticated request attempts to create an organization or read field parcels.
   *Expected: PERMISSION_DENIED.*

7. **Shadow Field Injection**:
   Attacker creates a crop with an extra undeclared ghost field `{ isVerifiedHarvest: true }`.
   *Expected: PERMISSION_DENIED (rejected by hasOnly keys check).*

8. **Terminal Record State Tampering**:
   Attacker attempts to modify an archived or paid invoice without accounting authorization.
   *Expected: PERMISSION_DENIED.*

9. **Orphan Field Creation**:
   Attacker creates a field with a non-existent `farmId`.
   *Expected: PERMISSION_DENIED.*

10. **Client-Delegated Scrape Attack**:
    Attacker runs collection query on `/organizations/{orgId}/sales` without org membership claim.
    *Expected: PERMISSION_DENIED.*

11. **Timestamp Backdating**:
    Attacker sets `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
    *Expected: PERMISSION_DENIED.*

12. **Unverified Email Mutation**:
    Attacker creates a user profile with `request.auth.token.email_verified == false` on privileged operations.
    *Expected: Handled with verification flow enforcement.*
