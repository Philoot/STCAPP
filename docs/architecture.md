# Proposed architecture

## High-level components
- **Front end:** Form-driven web UI for installers; evidence uploader with chunked/resumable uploads; reviewer console with evidence viewer and OCR side panel.
- **API layer:** Authentication, authorization, installation CRUD, evidence ingestion, validation orchestration, and audit logging.
- **Compliance engine:** Rules service evaluating CER requirements and product eligibility; returns pass/warn/fail with remediation guidance.
- **OCR/vision pipeline:** Extracts serials, model numbers, ratings, and labels from photos/videos; supports manual correction loop.
- **Storage:** Object storage for evidence; relational DB for transactional data; search index for serials and addresses.
- **Background workers:** OCR processing, product list sync, validation runs, export packaging, and notification dispatch.

## Data flows
1. **Evidence upload**
   - Client obtains a signed upload URL; uploads chunks directly to object storage.
   - API records a file stub (type tags, checksum, capture metadata).
   - Worker triggers OCR/vision job; results stored alongside evidence with confidence scores.

2. **Compliance validation**
   - Triggered on form save and when OCR completes.
   - Rules engine executes deterministic checks:
     - Accreditation validity on installation date.
     - Product eligibility on installation date using CER-approved lists.
     - System sizing (DC/AC ratio, inverter bounds, battery compatibility).
     - Evidence completeness by category and serial coverage.
     - Assignment signature timing and presence.
   - Results persisted per rule with pointers to fields/evidence; UI renders blocking vs. warning flags.

3. **Review and approval**
   - Reviewer queue fed by validation status.
   - Evidence viewer streams media from object storage with signed URLs.
   - Manual corrections to OCR text re-trigger relevant rules.
   - On approval, export package (JSON manifest + evidence hashes) generated for CER submission.

## Technology options
- **Front end:** React or Vue with TypeScript; component library (MUI/Chakra) for accessibility and form consistency.
- **API:** TypeScript (NestJS/Fastify) or Python (FastAPI) with JWT auth + role-based access.
- **Database:** Postgres for relational data; S3-compatible object storage for evidence; OpenSearch/Elasticsearch for full-text search on serials and addresses.
- **OCR/Vision:** Cloud (AWS Textract/Rekognition, Google Vision) or on-prem (Tesseract + OpenCV). For video, extract keyframes before OCR.
- **Queue/Workers:** Redis (RQ/BullMQ) or cloud-native queues for OCR and validation jobs.
- **Product lists:** Scheduled sync of CER-approved panel/inverter/battery lists into a normalized table with effective dates for historical checks.

## Key considerations
- **Evidence integrity:** Store file hashes; include in assignment PDF; keep immutable audit trail of submissions and approvals.
- **PII protection:** Field-level encryption for IDs and contact info; strict access controls and scoped signed URLs.
- **Observability:** Distributed tracing for uploads, OCR jobs, and validation runs; dashboards for rule failure rates and processing latency.
- **Scalability:** Stateless API behind load balancer; CDN for uploads/downloads; horizontal workers for OCR peaks.
- **Extensibility:** Rules engine driven by declarative configurations so policy changes do not require code deployments.
