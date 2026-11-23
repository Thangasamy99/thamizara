-- 005_simple_enquiries
-- Simplified enquiry model: demo requests + general enquiries stored as leads,
-- plus submission statuses for the admin follow-up workflow.

ALTER TABLE leads
  ADD COLUMN submission_type VARCHAR(30) DEFAULT NULL AFTER source,
  ADD KEY idx_leads_submission (submission_type),
  MODIFY COLUMN status ENUM(
    'NEW','CONTACTED','QUALIFIED','PROPOSAL_IN_PROGRESS',
    'CONVERTED','LOST','ON_HOLD','COMPLETED','CANCELLED'
  ) NOT NULL DEFAULT 'NEW';
