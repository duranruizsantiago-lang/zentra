-- CertFlow initial schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- admin, member, auditor
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_org ON users(organization_id);

CREATE TABLE connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gcp', 'aws', 'azure')),
    config TEXT NOT NULL, -- encrypted JSON
    status TEXT NOT NULL DEFAULT 'pending', -- pending, connected, error
    last_scan_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_connectors_org ON connectors(organization_id);

CREATE TABLE controls (
    id TEXT PRIMARY KEY,
    framework TEXT NOT NULL,
    category TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium'
);

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id TEXT NOT NULL REFERENCES controls(id),
    connector_id UUID NOT NULL REFERENCES connectors(id),
    resource TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'warn', 'manual')),
    finding TEXT NOT NULL DEFAULT '',
    raw_data JSONB DEFAULT '{}',
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_evidence_control ON evidence(control_id);
CREATE INDEX idx_evidence_connector ON evidence(connector_id);
CREATE INDEX idx_evidence_collected ON evidence(collected_at);

-- Seed controls for NIS2, DORA, ISO 27001, ENS
-- NIS2 controls
INSERT INTO controls (id, framework, category, code, title, description, severity) VALUES
('NIS2-GOV-01', 'NIS2', 'Governance', 'NIS2-GOV-01', 'Cybersecurity Risk Management', 'Implement measures to manage risks to network and information systems', 'critical'),
('NIS2-GOV-02', 'NIS2', 'Governance', 'NIS2-GOV-02', 'Management Accountability', 'Management body approves and oversees cybersecurity measures', 'high'),
('NIS2-INC-01', 'NIS2', 'Incident Response', 'NIS2-INC-01', 'Incident Notification', 'Notify CSIRT within 24h of significant incidents', 'critical'),
('NIS2-INC-02', 'NIS2', 'Incident Response', 'NIS2-INC-02', 'Incident Handling Procedures', 'Documented incident response plan with roles and responsibilities', 'high'),
('NIS2-BCP-01', 'NIS2', 'Business Continuity', 'NIS2-BCP-01', 'Backup Management', 'Regular backups with tested restoration procedures', 'high'),
('NIS2-SCM-01', 'NIS2', 'Supply Chain', 'NIS2-SCM-01', 'Supplier Security Assessment', 'Assess security posture of ICT suppliers', 'medium'),
('NIS2-ACC-01', 'NIS2', 'Access Control', 'NIS2-ACC-01', 'Identity and Access Management', 'Multi-factor authentication for critical systems', 'critical'),
('NIS2-CRY-01', 'NIS2', 'Cryptography', 'NIS2-CRY-01', 'Encryption at Rest and in Transit', 'Use strong encryption for sensitive data', 'high');

-- DORA controls
INSERT INTO controls (id, framework, category, code, title, description, severity) VALUES
('DORA-ICT-01', 'DORA', 'ICT Risk', 'DORA-ICT-01', 'ICT Risk Management Framework', 'Comprehensive framework for managing ICT risks', 'critical'),
('DORA-ICT-02', 'DORA', 'ICT Risk', 'DORA-ICT-02', 'Digital Operational Resilience Testing', 'Regular testing of digital operational resilience', 'critical'),
('DORA-INC-01', 'DORA', 'Incident Management', 'DORA-INC-01', 'ICT Incident Classification', 'Classify and report major ICT-related incidents', 'high'),
('DORA-TPR-01', 'DORA', 'Third-Party Risk', 'DORA-TPR-01', 'Third-Party Provider Oversight', 'Monitor and manage ICT third-party providers', 'high'),
('DORA-SHR-01', 'DORA', 'Information Sharing', 'DORA-SHR-01', 'Threat Intelligence Sharing', 'Participate in cyber threat information sharing', 'medium');

-- ISO 27001 controls
INSERT INTO controls (id, framework, category, code, title, description, severity) VALUES
('ISO-A5-01', 'ISO27001', 'Organizational', 'A.5.1', 'Information Security Policies', 'Set of policies for information security', 'critical'),
('ISO-A8-01', 'ISO27001', 'Asset Management', 'A.8.1', 'Asset Inventory', 'Inventory of information assets and responsibilities', 'high'),
('ISO-A9-01', 'ISO27001', 'Access Control', 'A.9.1', 'Access Control Policy', 'Business requirements for access control', 'critical'),
('ISO-A12-01', 'ISO27001', 'Operations', 'A.12.1', 'Operational Procedures', 'Documented operating procedures for IT systems', 'medium'),
('ISO-A16-01', 'ISO27001', 'Incident Management', 'A.16.1', 'Incident Response', 'Management of information security incidents', 'high');

-- ENS controls (Spanish National Security Scheme)
INSERT INTO controls (id, framework, category, code, title, description, severity) VALUES
('ENS-ORG-01', 'ENS', 'Organizacion', 'ENS-ORG-01', 'Politica de Seguridad', 'Documento de politica de seguridad aprobado por direccion', 'critical'),
('ENS-PRO-01', 'ENS', 'Proteccion', 'ENS-PRO-01', 'Proteccion de Instalaciones', 'Medidas fisicas de proteccion de CPD y equipos', 'high'),
('ENS-COP-01', 'ENS', 'Continuidad', 'ENS-COP-01', 'Plan de Continuidad', 'Plan de continuidad de negocio documentado y probado', 'high');
