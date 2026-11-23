-- 003_public_enquiries
-- Reference-number counters, idempotency records for public submissions,
-- extra lead columns for contact-form fields, email recipient on notifications.

-- Monotonic per-scope-per-year counters → LD-2025-00001 / QT-2025-00001
CREATE TABLE IF NOT EXISTS counters (
  name  VARCHAR(60) NOT NULL,
  value BIGINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Idempotency: one row per (scope, key). Hash of the payload is stored so a
-- key reused with a DIFFERENT body is rejected; completed rows hold the
-- original response for safe retries.
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scope        VARCHAR(60) NOT NULL,
  key_hash     CHAR(64) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  status       ENUM('in_progress','completed','failed') NOT NULL DEFAULT 'in_progress',
  response     JSON DEFAULT NULL,
  lead_id      BIGINT UNSIGNED DEFAULT NULL,
  expires_at   DATETIME NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_idem_scope_key (scope, key_hash),
  KEY idx_idem_expires (expires_at),
  CONSTRAINT fk_idem_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE leads
  ADD COLUMN subject VARCHAR(190) DEFAULT NULL AFTER whatsapp,
  ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER subject,
  ADD COLUMN service_level VARCHAR(60) DEFAULT NULL AFTER service_category;

-- Recipient address for outbound email notifications.
ALTER TABLE notifications
  ADD COLUMN recipient VARCHAR(190) DEFAULT NULL AFTER user_id,
  ADD COLUMN attempts INT UNSIGNED NOT NULL DEFAULT 0 AFTER status;

INSERT IGNORE INTO counters (name, value) VALUES ('lead', 0), ('quotation', 0);
