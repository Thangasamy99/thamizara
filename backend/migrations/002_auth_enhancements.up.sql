-- 002_auth_enhancements
-- Adds: user profile image, login-throttling fields, refresh-token
-- families (rotation + reuse detection), password-reset metadata.

ALTER TABLE users
  ADD COLUMN profile_image_url VARCHAR(500) DEFAULT NULL AFTER phone,
  ADD COLUMN failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN locked_until DATETIME DEFAULT NULL AFTER failed_login_attempts,
  MODIFY COLUMN status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE';

-- family_id ties together tokens issued by rotation; if a revoked token is
-- presented again the whole family is revoked (reuse detection).
ALTER TABLE refresh_tokens
  ADD COLUMN family_id CHAR(36) NOT NULL DEFAULT '' AFTER user_id,
  ADD KEY idx_refresh_tokens_family (family_id);

ALTER TABLE password_reset_tokens
  ADD COLUMN ip VARCHAR(45) DEFAULT NULL AFTER used_at;
