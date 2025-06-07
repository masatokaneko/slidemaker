-- ユーザー管理・認証システムのデータベーススキーマ

-- ユーザーテーブル
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'user',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- アカウントテーブル（OAuth用）
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- セッションテーブル
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- プロジェクトテーブル
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  yaml_data TEXT,
  tags TEXT[], -- PostgreSQLの配列型
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- スライドテーブル
CREATE TABLE slides (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB, -- スライドの構造化データ
  slide_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- テンプレートテーブル
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry TEXT NOT NULL,
  yaml_data TEXT NOT NULL,
  thumbnail TEXT,
  is_public BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- テンプレート使用履歴
CREATE TABLE template_usage (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  project_id TEXT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- チームテーブル
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- チームメンバーテーブル
CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(team_id, user_id)
);

-- プロジェクト共有テーブル
CREATE TABLE project_shares (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  permission TEXT DEFAULT 'view', -- view, edit, admin
  shared_by TEXT NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE
);

-- バージョン履歴テーブル
CREATE TABLE project_versions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  yaml_data TEXT NOT NULL,
  changes_summary TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_slides_project_id ON slides(project_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_industry ON templates(industry);
CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_project_shares_project_id ON project_shares(project_id);
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);

-- サンプルデータの挿入
INSERT INTO users (id, name, email, role) VALUES 
('user-1', 'Admin User', 'admin@example.com', 'admin'),
('user-2', 'Test User', 'test@example.com', 'user');

INSERT INTO templates (id, title, description, category, industry, yaml_data, is_public, featured, user_id) VALUES 
('template-1', 'BCG戦略分析テンプレート', 'コンサルティング向けの戦略分析テンプレート', 'consulting', 'consulting', '---\ntitle: 戦略分析\nslides:\n  - type: title\n    content:\n      title: 戦略分析\n      subtitle: BCGスタイル', true, true, 'user-1'),
('template-2', '営業プレゼンテンプレート', '営業向けのプレゼンテーションテンプレート', 'sales', 'technology', '---\ntitle: 営業プレゼン\nslides:\n  - type: title\n    content:\n      title: 営業プレゼン\n      subtitle: 製品紹介', true, false, 'user-1');

COMMIT;
