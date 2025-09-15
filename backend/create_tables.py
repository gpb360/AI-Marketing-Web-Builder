import sqlite3
import uuid
from datetime import datetime

# Connect to the database
conn = sqlite3.connect('analytics_demo.db')
cursor = conn.cursor()

# Create templates table
cursor.execute('''
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT,
    preview_image TEXT,
    thumbnail_image TEXT,
    demo_url TEXT,
    config TEXT,
    components TEXT,
    styles TEXT,
    tags TEXT,
    meta_title TEXT,
    meta_description TEXT,
    usage_count INTEGER,
    is_premium BOOLEAN,
    is_featured BOOLEAN
)
''')

# Create template_components table
cursor.execute('''
CREATE TABLE IF NOT EXISTS template_components (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    component_type TEXT NOT NULL,
    props TEXT,
    styles TEXT,
    html_template TEXT,
    css_styles TEXT,
    javascript TEXT,
    category TEXT,
    tags TEXT,
    is_responsive BOOLEAN,
    is_interactive BOOLEAN,
    usage_count INTEGER
)
''')

# Create projects table
cursor.execute('''
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    owner_id TEXT NOT NULL,
    template_id TEXT,
    config TEXT,
    custom_css TEXT,
    custom_js TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    subdomain TEXT,
    custom_domain TEXT,
    is_published BOOLEAN,
    published_url TEXT,
    analytics_code TEXT,
    tracking_enabled BOOLEAN,
    FOREIGN KEY (owner_id) REFERENCES users (id),
    FOREIGN KEY (template_id) REFERENCES templates (id)
)
''')

# Create project_pages table
cursor.execute('''
CREATE TABLE IF NOT EXISTS project_pages (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    is_homepage BOOLEAN,
    is_published BOOLEAN,
    order_index INTEGER,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    project_id TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id)
)
''')

# Create sites table
cursor.execute('''
CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    user_id TEXT NOT NULL,
    template_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    subdomain TEXT,
    custom_domain TEXT,
    status TEXT,
    published_at DATETIME,
    settings TEXT,
    theme_config TEXT,
    meta_title TEXT,
    meta_description TEXT,
    favicon_url TEXT,
    total_views INTEGER,
    unique_visitors INTEGER,
    conversion_rate INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (template_id) REFERENCES templates (id)
)
''')

# Create indexes for sites table
cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS ix_sites_subdomain ON sites (subdomain)')
cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS ix_sites_custom_domain ON sites (custom_domain)')

# Create components table
cursor.execute('''
CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    site_id TEXT NOT NULL,
    component_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config TEXT NOT NULL,
    styles TEXT,
    position TEXT,
    order_index INTEGER,
    workflows_connected TEXT,
    views INTEGER,
    interactions INTEGER,
    conversions INTEGER,
    FOREIGN KEY (site_id) REFERENCES sites (id)
)
''')

# Create published_sites table
cursor.execute('''
CREATE TABLE IF NOT EXISTS published_sites (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    site_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    custom_domain TEXT,
    ssl_status TEXT,
    domain_status TEXT,
    build_status TEXT,
    build_started_at DATETIME,
    build_completed_at DATETIME,
    build_duration INTEGER,
    cdn_url TEXT,
    preview_url TEXT,
    seo_settings TEXT,
    analytics_id TEXT,
    performance_score INTEGER,
    ssl_issued_at DATETIME,
    ssl_expires_at DATETIME,
    ssl_provider TEXT,
    build_size INTEGER,
    build_hash TEXT,
    FOREIGN KEY (site_id) REFERENCES sites (id)
)
''')

# Create indexes for published_sites table
cursor.execute('CREATE INDEX IF NOT EXISTS ix_published_sites_domain ON published_sites (domain)')
cursor.execute('CREATE INDEX IF NOT EXISTS ix_published_sites_custom_domain ON published_sites (custom_domain)')

# Create deployment_history table
cursor.execute('''
CREATE TABLE IF NOT EXISTS deployment_history (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    published_site_id TEXT NOT NULL,
    version TEXT NOT NULL,
    tag TEXT,
    build_time DATETIME NOT NULL,
    build_duration INTEGER,
    build_status TEXT NOT NULL,
    build_logs TEXT,
    build_size INTEGER,
    build_hash TEXT,
    rollback_data TEXT,
    is_rollback BOOLEAN,
    rollback_from_version TEXT,
    performance_score INTEGER,
    load_time REAL,
    bundle_size INTEGER,
    seo_score INTEGER,
    accessibility_score INTEGER,
    FOREIGN KEY (published_site_id) REFERENCES published_sites (id)
)
''')

# Commit changes and close connection
conn.commit()
conn.close()

print("Tables created successfully!")