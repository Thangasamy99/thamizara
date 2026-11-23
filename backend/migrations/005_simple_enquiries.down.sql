-- Rollback 005_simple_enquiries
-- Any leads already in COMPLETED/CANCELLED must be moved before shrinking the ENUM.
UPDATE leads SET status = 'ON_HOLD' WHERE status IN ('COMPLETED','CANCELLED');
ALTER TABLE leads
  MODIFY COLUMN status ENUM(
    'NEW','CONTACTED','QUALIFIED','PROPOSAL_IN_PROGRESS',
    'CONVERTED','LOST','ON_HOLD'
  ) NOT NULL DEFAULT 'NEW',
  DROP KEY idx_leads_submission,
  DROP COLUMN submission_type;
