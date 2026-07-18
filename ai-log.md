# AI Usage Log

Minimum five entries from different stages of the project. Format: Goal → Prompt (verbatim) + tool → Result → What I learned.

---

## Entry 1 — Understanding the PRD scope

**Goal:** Turn the Georgian PRD into a clear build order (CORE then FULL).

**Tool:** Cursor (Grok)

**Prompt (verbatim):**
> lets read what needs to be done and create a plan to implement this

**Result:** Used. The model extracted requirements from `10X-CRM-Exam-PRD.docx` and produced a phased plan (auth → clients core → FULL features → docs/deploy). I kept the plan’s file layout and exact localStorage key names from the PRD.

**What I learned:** Asking for a plan first forces CORE vs FULL prioritization instead of coding every page at once.

---

## Entry 2 — Prompt refinement (vague → specific)

**Goal:** Get correct signup validation messages.

**Tool:** Cursor

**Prompt 1 (vague):**
> make the signup form work with validation

**Result:** Rejected as too vague — risk of invented error strings.

**Prompt 2 (refined):**
> Implement signup.html validation on submit with preventDefault. Exact error texts from PRD: Full name must be at least 3 characters; Please enter a valid email address; An account with this email already exists; Password must be at least 8 characters and contain a letter and a number; Passwords do not match. Show all errors at once. On success save User to crm_users and toast then redirect after 1.5s.

**Result:** Used. Validation matches the PRD and is easier to defend in the oral exam.

**What I learned:** Copying exact PRD strings into the prompt prevents “creative” UI copy that would fail grading.

---

## Entry 3 — Critical evaluation of an AI suggestion

**Goal:** Persist passwords safely for a school project.

**Tool:** Cursor / general AI advice

**Prompt (verbatim):**
> Should we hash passwords with bcrypt in the browser before saving to localStorage?

**Result:** Critically rejected for this exam project. The PRD explicitly stores plain-text passwords in `crm_users` because there is no backend. Browser-side hashing without a server still leaves credentials recoverable from localStorage and does not match the required data model. I kept plain text as specified and prepared to explain why this is unacceptable in a real product.

**What I learned:** Always check the assignment’s data model before “improving” security; exam rubrics can require the insecure teaching approach on purpose.

---

## Entry 4 — Clients data layer + DummyJSON

**Goal:** Implement load / add / delete with localStorage as source of truth.

**Tool:** Cursor

**Prompt (verbatim):**
> Create clients-data.js: if crm_clients exists use it, else GET https://dummyjson.com/users?limit=30, map to Client objects, save. POST /users/add then unshift. DELETE /users/{id} and remove from state even on 404. Use async/await and try/catch.

**Result:** Used, with a small change: on network failure during delete I still remove locally so the UI stays consistent with the PRD’s “state is truth” cycle.

**What I learned:** DummyJSON mutates are simulated — Network tab shows requests, but only localStorage survives reload.

---

## Entry 5 — Dashboard formulas

**Goal:** Match PRD stats exactly (Active Deals, Won Revenue, New This Week).

**Tool:** Cursor

**Prompt (verbatim):**
> Dashboard stats from clients state: Total = length; Active Deals = status not Won and not Lost; Won Revenue = sum dealValue of Won with $ formatting; New This Week = createdAt within 7 days using (Date.now() - new Date(c.createdAt)) / 86400000 <= 7. Recent = sort createdAt desc slice 0,5.

**Result:** Used as written in `dashboard.js`.

**What I learned:** Writing formulas into the prompt avoids off-by-one mistakes (e.g. treating Contacted as inactive).

---

## Entry 6 — Docs and deploy package

**Goal:** Finish D1/D2 deliverables and static hosting.

**Tool:** Cursor

**Prompt (verbatim):**
> Write README.md in English with About, Features, Tech Stack, How to Run, Live Demo, Test Account, Credits. Also glossary.md (10 terms EN + Georgian) and research-note.md from MDN or DummyJSON docs.

**Result:** Used as a draft; I edited wording so I can explain every section in my own words for the English oral part.

**What I learned:** Documentation is part of the grade — treating README as a first-class deliverable saves time before the demo.
