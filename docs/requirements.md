# Functional requirements

## Primary goals
- Let accredited solar and battery installers assign their rights to create STCs to your company.
- Capture all installation data required by the Clean Energy Regulator (CER) in a structured way.
- Validate data for compliance before submission.
- Collect, store, and review supporting evidence (photos and video), including OCR extraction of serial numbers and certificates.

## User roles
- **Installer (accredited person):** submits installations, evidence, and assignment consent.
- **Company reviewer:** verifies compliance outcomes, requests fixes, and approves submissions for STC creation.
- **Auditor (read-only):** views immutable records and evidence.

## Core workflows
1. **Installer onboarding**
   - CEC accreditation verification (number, expiry).
   - Company association and identity verification (government ID + selfie match).

2. **System registration**
   - Capture system metadata: installation address, NMI/MIRN, postcode zone, DNSP, installation date, CER-approved panel and inverter models, battery model (if present), PV array size, inverter capacity, tilt/azimuth, shading notes, and mounting method.
   - Capture installer and designer details (names, accreditation numbers, license/state, contact).

3. **Evidence collection**
   - Upload photos/videos for:
     - Rooftop array showing panel count and layout.
     - Inverter and battery nameplates (brand, model, serials, ratings).
     - Panel serial numbers (random samples and full array scan when available).
     - Meter board and shutdown/isolation switches.
     - CEC compliance labels and array frame earthing.
   - Accept common formats (JPEG/PNG/HEIC for photos, MP4/MOV for video).
   - File size limits with streaming uploads and resumable transfers.
   - OCR/vision extraction to auto-read serial numbers, model numbers, ratings, and address labels where present.

4. **Assignment of STC rights**
   - Present CER-compliant assignment wording with e-signature (draw/type) and timestamped consent.
   - Capture system owner details and contact info.
   - Store immutable assignment artifact (PDF with evidence hash).

5. **Compliance validation**
   - Mandatory fields enforced with inline guidance.
   - Rules engine checks (examples):
     - CEC accreditation is current on installation date.
     - Components appear on CER-approved product lists on installation date.
     - System size within inverter capacity bounds; DC/AC ratio thresholds flagged.
     - Postcode eligibility and climate zone mapping for STC deeming.
     - Installation date within STC eligibility window.
     - Evidence coverage: required photo categories present; serial count meets sampling minimums.
     - Assignment consent present and signed after installation date.
   - Blocking vs. warning-level rules with explanations and remediation tips.

6. **Review and submission**
   - Reviewer queue with status filters (draft, needs fixes, ready, approved, rejected).
   - Side-by-side evidence viewer with OCR-extracted text and manual correction.
   - Audit log of edits, validations, and approvals (user, timestamp, before/after deltas).
   - Export package for CER submission (JSON + evidence manifest).

## Data model (high level)
- **Installation**: id, owner details, site details, DNSP, installer/designer links, products, performance settings, evidence manifest, status.
- **Products**: panels, inverters, batteries with brand/model, serials, CER list references, installation date check metadata.
- **Assignment**: consent copy, signer, signature artifact, timestamps, hash of evidence set.
- **Evidence**: files with type tags, capture timestamps, GPS/EXIF (if available), OCR-extracted text, reviewer annotations.
- **Validation result**: rule id, outcome (pass/warn/fail), message, and linked fields/evidence.

## Non-functional requirements
- **Security & compliance:** encrypt data in transit and at rest, PII minimization, access control per role, audit logging, and immutable evidence hashes.
- **Reliability:** resumable uploads, background OCR retries, idempotent submissions, and webhooks/events for processing status.
- **Performance:** near-real-time validation feedback; OCR completed within defined SLAs (e.g., 2–5 minutes for full evidence set).
- **Observability:** metrics for upload success, OCR accuracy, rule failure rates, and reviewer throughput.
- **Data retention:** policy-driven retention and purge; export on request.
