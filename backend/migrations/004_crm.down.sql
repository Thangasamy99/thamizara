-- Rollback 004_crm
ALTER TABLE customers
  DROP FOREIGN KEY fk_customers_creator,
  DROP KEY uq_customers_reference,
  DROP COLUMN reference,
  DROP COLUMN created_by;
