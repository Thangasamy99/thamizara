-- ============================================================
-- THAMIZARA Technologies — 001_initial_schema
-- MySQL 8.x · InnoDB · utf8mb4
-- Business records use soft deletes; history tables have no
-- cascade deletes so audit data can never be destroyed by a
-- parent row removal.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── Auth / RBAC ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(50) DEFAULT NULL,
  status        ENUM('active','invited','suspended') NOT NULL DEFAULT 'active',
  last_login_at DATETIME DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(80) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id    BIGINT UNSIGNED NOT NULL,
  role_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_roles_role (role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  KEY idx_role_permissions_perm (permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  token_hash   CHAR(64) NOT NULL,
  expires_at   DATETIME NOT NULL,
  revoked_at   DATETIME DEFAULT NULL,
  ip           VARCHAR(45) DEFAULT NULL,
  user_agent   VARCHAR(255) DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user (user_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at    DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_prt_hash (token_hash),
  KEY idx_prt_user (user_id),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Leads ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference           VARCHAR(20) NOT NULL,
  name                VARCHAR(150) NOT NULL,
  business_name       VARCHAR(190) DEFAULT NULL,
  email               VARCHAR(190) NOT NULL,
  whatsapp            VARCHAR(50) DEFAULT NULL,
  country             VARCHAR(100) DEFAULT NULL,
  city                VARCHAR(100) DEFAULT NULL,
  service_category    VARCHAR(80) DEFAULT NULL,
  project_type        VARCHAR(120) DEFAULT NULL,
  description         TEXT DEFAULT NULL,
  features            JSON DEFAULT NULL,
  existing_software   VARCHAR(255) DEFAULT NULL,
  approach            VARCHAR(80) DEFAULT NULL,
  budget_range        VARCHAR(120) DEFAULT NULL,
  budget_currency     ENUM('XAF','NGN','USD') DEFAULT NULL,
  timeline            VARCHAR(80) DEFAULT NULL,
  source              ENUM('contact_form','quotation_wizard','admin','manual','other') NOT NULL DEFAULT 'other',
  status              ENUM('NEW','CONTACTED','QUALIFIED','PROPOSAL_IN_PROGRESS','CONVERTED','LOST','ON_HOLD') NOT NULL DEFAULT 'NEW',
  assigned_to         BIGINT UNSIGNED DEFAULT NULL,
  converted_customer_id BIGINT UNSIGNED DEFAULT NULL,
  idempotency_key     VARCHAR(120) DEFAULT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_leads_reference (reference),
  UNIQUE KEY uq_leads_idempotency (idempotency_key),
  KEY idx_leads_status (status),
  KEY idx_leads_email (email),
  KEY idx_leads_service_category (service_category),
  KEY idx_leads_country (country),
  KEY idx_leads_source (source),
  KEY idx_leads_assigned (assigned_to),
  KEY idx_leads_created (created_at),
  CONSTRAINT fk_leads_assigned FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
  -- converted_customer_id FK added after customers table exists
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_notes (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED DEFAULT NULL,
  note       TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_notes_lead (lead_id),
  CONSTRAINT fk_lead_notes_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE RESTRICT,
  CONSTRAINT fk_lead_notes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_assignments (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id     BIGINT UNSIGNED NOT NULL,
  assigned_to BIGINT UNSIGNED DEFAULT NULL,
  assigned_by BIGINT UNSIGNED DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_assign_lead (lead_id),
  CONSTRAINT fk_lead_assign_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE RESTRICT,
  CONSTRAINT fk_lead_assign_to FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_lead_assign_by FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Customers ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150) NOT NULL,
  business_name VARCHAR(190) DEFAULT NULL,
  email         VARCHAR(190) DEFAULT NULL,
  phone         VARCHAR(50) DEFAULT NULL,
  whatsapp      VARCHAR(50) DEFAULT NULL,
  country       VARCHAR(100) DEFAULT NULL,
  city          VARCHAR(100) DEFAULT NULL,
  address       VARCHAR(255) DEFAULT NULL,
  type          ENUM('INDIVIDUAL','SMALL_BUSINESS','COMPANY','EDUCATIONAL_INSTITUTION','HEALTHCARE','HOSPITALITY','REAL_ESTATE','NON_PROFIT','OTHER') NOT NULL DEFAULT 'INDIVIDUAL',
  notes         TEXT DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_customers_email (email),
  KEY idx_customers_type (type),
  KEY idx_customers_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A lead may be converted into a customer; keep the link without cascade.
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_customer FOREIGN KEY (converted_customer_id) REFERENCES customers (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS customer_notes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED DEFAULT NULL,
  note        TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_customer_notes_customer (customer_id),
  CONSTRAINT fk_customer_notes_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_notes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Quotations ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotations (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quote_number    VARCHAR(20) NOT NULL,
  lead_id         BIGINT UNSIGNED DEFAULT NULL,
  customer_id     BIGINT UNSIGNED DEFAULT NULL,
  title           VARCHAR(190) NOT NULL,
  service_category VARCHAR(80) DEFAULT NULL,
  description     TEXT DEFAULT NULL,
  features        JSON DEFAULT NULL,
  budget_range    VARCHAR(120) DEFAULT NULL,
  budget_currency ENUM('XAF','NGN','USD') DEFAULT NULL,
  timeline        VARCHAR(80) DEFAULT NULL,
  currency        ENUM('XAF','NGN','USD') NOT NULL DEFAULT 'XAF',
  status          ENUM('REQUESTED','UNDER_REVIEW','DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  subtotal        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  tax             DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total           DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  valid_until     DATE DEFAULT NULL,
  terms           TEXT DEFAULT NULL,
  notes           TEXT DEFAULT NULL,
  version         INT UNSIGNED NOT NULL DEFAULT 1,
  sent_at         DATETIME DEFAULT NULL,
  responded_at    DATETIME DEFAULT NULL,
  public_token    VARCHAR(80) DEFAULT NULL,
  created_by      BIGINT UNSIGNED DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quotations_number (quote_number),
  UNIQUE KEY uq_quotations_token (public_token),
  KEY idx_quotations_status (status),
  KEY idx_quotations_customer (customer_id),
  KEY idx_quotations_lead (lead_id),
  KEY idx_quotations_currency (currency),
  KEY idx_quotations_created (created_at),
  CONSTRAINT fk_quotations_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL,
  CONSTRAINT fk_quotations_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
  CONSTRAINT fk_quotations_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotation_items (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quotation_id BIGINT UNSIGNED NOT NULL,
  description  VARCHAR(255) NOT NULL,
  quantity     DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price   DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  sort_order   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quotation_items_quote (quotation_id),
  CONSTRAINT fk_quotation_items_quote FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Immutable snapshots of every sent/revised quotation version.
CREATE TABLE IF NOT EXISTS quotation_revisions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quotation_id BIGINT UNSIGNED NOT NULL,
  version      INT UNSIGNED NOT NULL,
  snapshot     JSON NOT NULL,
  created_by   BIGINT UNSIGNED DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quote_rev (quotation_id, version),
  CONSTRAINT fk_quote_rev_quote FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE RESTRICT,
  CONSTRAINT fk_quote_rev_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Projects ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code              VARCHAR(20) NOT NULL,
  title             VARCHAR(190) NOT NULL,
  customer_id       BIGINT UNSIGNED DEFAULT NULL,
  quotation_id      BIGINT UNSIGNED DEFAULT NULL,
  description       TEXT DEFAULT NULL,
  service_category  VARCHAR(80) DEFAULT NULL,
  start_date        DATE DEFAULT NULL,
  expected_delivery DATE DEFAULT NULL,
  completed_at      DATETIME DEFAULT NULL,
  currency          ENUM('XAF','NGN','USD') NOT NULL DEFAULT 'XAF',
  amount            DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  manager_id        BIGINT UNSIGNED DEFAULT NULL,
  progress          TINYINT UNSIGNED NOT NULL DEFAULT 0 CHECK (progress <= 100),
  status            ENUM('PLANNING','NOT_STARTED','IN_PROGRESS','ON_HOLD','REVIEW','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PLANNING',
  notes             TEXT DEFAULT NULL,
  created_by        BIGINT UNSIGNED DEFAULT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_code (code),
  KEY idx_projects_status (status),
  KEY idx_projects_customer (customer_id),
  KEY idx_projects_manager (manager_id),
  CONSTRAINT fk_projects_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_quotation FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_manager FOREIGN KEY (manager_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_members (
  project_id       BIGINT UNSIGNED NOT NULL,
  user_id          BIGINT UNSIGNED NOT NULL,
  role_in_project  VARCHAR(80) DEFAULT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id),
  CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
  CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_milestones (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id   BIGINT UNSIGNED NOT NULL,
  title        VARCHAR(190) NOT NULL,
  due_date     DATE DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  status       ENUM('pending','completed') NOT NULL DEFAULT 'pending',
  sort_order   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_milestones_project (project_id),
  CONSTRAINT fk_milestones_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_updates (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED DEFAULT NULL,
  update_text TEXT NOT NULL,
  progress   TINYINT UNSIGNED DEFAULT NULL CHECK (progress IS NULL OR progress <= 100),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_project_updates_project (project_id),
  CONSTRAINT fk_project_updates_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
  CONSTRAINT fk_project_updates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tasks ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id   BIGINT UNSIGNED DEFAULT NULL,
  title        VARCHAR(190) NOT NULL,
  description  TEXT DEFAULT NULL,
  assigned_to  BIGINT UNSIGNED DEFAULT NULL,
  priority     ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  start_date   DATE DEFAULT NULL,
  due_date     DATE DEFAULT NULL,
  status       ENUM('TODO','IN_PROGRESS','REVIEW','COMPLETED','CANCELLED') NOT NULL DEFAULT 'TODO',
  completed_at DATETIME DEFAULT NULL,
  created_by   BIGINT UNSIGNED DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at   DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_tasks_project (project_id),
  KEY idx_tasks_assigned (assigned_to),
  KEY idx_tasks_status (status),
  KEY idx_tasks_priority (priority),
  KEY idx_tasks_due (due_date),
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assigned FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_comments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED DEFAULT NULL,
  comment    TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_task_comments_task (task_id),
  CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE RESTRICT,
  CONSTRAINT fk_task_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Follow-ups ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS followups (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lead_id       BIGINT UNSIGNED DEFAULT NULL,
  customer_id   BIGINT UNSIGNED DEFAULT NULL,
  assigned_to   BIGINT UNSIGNED DEFAULT NULL,
  followup_date DATETIME NOT NULL,
  type          ENUM('PHONE_CALL','EMAIL','WHATSAPP','MEETING','OTHER') NOT NULL DEFAULT 'PHONE_CALL',
  description   TEXT DEFAULT NULL,
  status        ENUM('SCHEDULED','COMPLETED','MISSED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  outcome       TEXT DEFAULT NULL,
  completed_at  DATETIME DEFAULT NULL,
  created_by    BIGINT UNSIGNED DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_followups_date_status (status, followup_date),
  KEY idx_followups_lead (lead_id),
  KEY idx_followups_customer (customer_id),
  KEY idx_followups_assigned (assigned_to),
  CONSTRAINT fk_followups_lead FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE RESTRICT,
  CONSTRAINT fk_followups_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
  CONSTRAINT fk_followups_assigned FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_followups_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED DEFAULT NULL,
  type        VARCHAR(60) NOT NULL,
  title       VARCHAR(190) NOT NULL,
  body        TEXT DEFAULT NULL,
  channel     ENUM('in_app','email') NOT NULL DEFAULT 'in_app',
  status      ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  entity_type VARCHAR(60) DEFAULT NULL,
  entity_id   BIGINT UNSIGNED DEFAULT NULL,
  sent_at     DATETIME DEFAULT NULL,
  read_at     DATETIME DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, status),
  KEY idx_notifications_status (status),
  KEY idx_notifications_entity (entity_type, entity_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_attempts (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  notification_id BIGINT UNSIGNED NOT NULL,
  attempt_no      INT UNSIGNED NOT NULL DEFAULT 1,
  status          ENUM('sent','failed') NOT NULL,
  error           VARCHAR(500) DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_attempts_notif (notification_id),
  CONSTRAINT fk_notif_attempts_notif FOREIGN KEY (notification_id) REFERENCES notifications (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Audit & settings ─────────────────────────────────────────

-- Immutable: no updated_at, no FK that can cascade.
CREATE TABLE IF NOT EXISTS activity_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_id    BIGINT UNSIGNED DEFAULT NULL,
  action      VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60) DEFAULT NULL,
  entity_id   BIGINT UNSIGNED DEFAULT NULL,
  summary     VARCHAR(500) DEFAULT NULL,
  ip          VARCHAR(45) DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_actor (actor_id),
  KEY idx_activity_entity (entity_type, entity_id),
  KEY idx_activity_created (created_at),
  CONSTRAINT fk_activity_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_settings (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(80) NOT NULL,
  value       JSON DEFAULT NULL,
  updated_by  BIGINT UNSIGNED DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key),
  CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
