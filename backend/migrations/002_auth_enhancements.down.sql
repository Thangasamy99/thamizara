-- Rollback 002_auth_enhancements
ALTER TABLE password_reset_tokens
  DROP COLUMN ip;

ALTER TABLE refresh_tokens
  DROP KEY idx_refresh_tokens_family,
  DROP COLUMN family_id;

ALTER TABLE users
  DROP COLUMN locked_until,
  DROP COLUMN failed_login_attempts,
  DROP COLUMN profile_image_url,
  MODIFY COLUMN status ENUM('active','invited','suspended') NOT NULL DEFAULT 'active';
