-- Rollback 003_public_enquiries
ALTER TABLE notifications
  DROP COLUMN recipient,
  DROP COLUMN attempts;

ALTER TABLE leads
  DROP COLUMN subject,
  DROP COLUMN phone,
  DROP COLUMN service_level;

DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS counters;
