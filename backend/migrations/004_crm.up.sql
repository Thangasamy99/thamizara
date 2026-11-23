-- 004_crm
-- Customer reference numbers + creator tracking for the CRM module.

ALTER TABLE customers
  ADD COLUMN reference VARCHAR(20) DEFAULT NULL AFTER id,
  ADD COLUMN created_by BIGINT UNSIGNED DEFAULT NULL AFTER notes,
  ADD UNIQUE KEY uq_customers_reference (reference),
  ADD CONSTRAINT fk_customers_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL;

-- Backfill references for any pre-existing customers.
UPDATE customers SET reference = CONCAT('CU-', YEAR(created_at), '-', LPAD(id, 5, '0'))
  WHERE reference IS NULL;

-- Seed the per-year counters (named "customer:YYYY") past the backfilled suffixes
-- so generated references can never collide with backfilled ones.
INSERT INTO counters (name, value)
SELECT CONCAT('customer:', yr), mx
  FROM (SELECT YEAR(created_at) AS yr, MAX(id) AS mx FROM customers GROUP BY yr) t
ON DUPLICATE KEY UPDATE value = GREATEST(value, VALUES(value));
