-- =============================================================================
-- Idempotent Rich Demo & Exploration Seed Data for BizApps Referrals
-- Covers: IT & Tech Consulting (Cloud, Cybersecurity, AI/LLM, Data, ERP),
--         Legal, Accounting & Tax, and Medical / Clinical Informatics.
-- Safe to run multiple times (idempotent by deterministic IDs / unique codes).
-- =============================================================================
SET NOCOUNT ON;

-- 1. Ensure Application DefaultNavItems includes Report Gallery
UPDATE [__mj].[Application]
SET [DefaultNavItems] = N'[
  {"Label":"Seeker Intake","Icon":"fa-solid fa-magnifying-glass","ResourceType":"Custom","DriverClass":"ReferralsSeekerIntakeResource","isDefault":true},
  {"Label":"Pro Lead Inbox","Icon":"fa-solid fa-inbox","ResourceType":"Custom","DriverClass":"ReferralsProInboxResource"},
  {"Label":"Ops Telemetry","Icon":"fa-solid fa-chart-line","ResourceType":"Custom","DriverClass":"ReferralsOpsTelemetryResource"},
  {"Label":"Report Gallery","Icon":"fa-solid fa-chart-pie","ResourceType":"Custom","DriverClass":"ReferralsReportGalleryResource"}
]'
WHERE [Name] = N'Referrals';

-- 2. Seed Practice Areas (IT Consulting, Accounting, Medical, plus existing Legal)
IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_CLOUD_ARCH')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000006', N'Cloud Architecture & FinOps', N'IT_CLOUD_ARCH', N'IT Consulting', N'Multi-cloud migrations, Kubernetes platform engineering, AWS/Azure landing zones, and cloud cost optimization.', N'fa-solid fa-cloud', 60, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_CYBER_SOC2')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000007', N'Cybersecurity & SOC2 Compliance', N'IT_CYBER_SOC2', N'IT Consulting', N'Zero-trust architecture, penetration testing, SOC2 Type II / ISO 27001 readiness, and incident response.', N'fa-solid fa-shield-halved', 70, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_AI_LLM')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000008', N'Enterprise AI & LLM Engineering', N'IT_AI_LLM', N'IT Consulting', N'Production RAG pipelines, agentic AI workflows, model evaluation, and AI governance.', N'fa-solid fa-brain', 80, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_DATA_ENG')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000009', N'Data Engineering & Lakehouse', N'IT_DATA_ENG', N'IT Consulting', N'Modern data warehouses, dbt/Spark pipelines, real-time streaming, and BI modernization.', N'fa-solid fa-database', 90, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_ERP_INT')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000010', N'ERP & Enterprise Integration', N'IT_ERP_INT', N'IT Consulting', N'NetSuite, SAP, Salesforce, and API middleware modernization for mid-market and enterprise.', N'fa-solid fa-diagram-project', 100, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'ACCT_TAX_RD')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000011', N'Corporate Tax & R&D Credits', N'ACCT_TAX_RD', N'Accounting', N'Section 174 R&D tax credits, multi-state nexus compliance, and M&A tax structuring.', N'fa-solid fa-calculator', 110, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'MED_INFORMATICS')
  INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID],[Name],[Code],[Category],[Description],[IconClass],[DisplayRank],[IsActive])
  VALUES ('A1000001-0000-0000-0000-000000000012', N'Clinical Informatics & Telehealth', N'MED_INFORMATICS', N'Medical', N'HIPAA-compliant telehealth workflows, EHR interoperability (FHIR), and clinical decision support.', N'fa-solid fa-stethoscope', 120, 1);

-- 3. Seed Additional Jurisdictions
IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-MA')
  INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID],[Name],[Code],[JurisdictionType],[CountryCode],[StateProvinceCode],[IsActive])
  VALUES ('B1000001-0000-0000-0000-000000000006', N'Massachusetts', N'US-MA', N'State', N'US', N'MA', 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-WA')
  INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID],[Name],[Code],[JurisdictionType],[CountryCode],[StateProvinceCode],[IsActive])
  VALUES ('B1000001-0000-0000-0000-000000000007', N'Washington', N'US-WA', N'State', N'US', N'WA', 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-IL')
  INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID],[Name],[Code],[JurisdictionType],[CountryCode],[StateProvinceCode],[IsActive])
  VALUES ('B1000001-0000-0000-0000-000000000008', N'Illinois', N'US-IL', N'State', N'US', N'IL', 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-FL')
  INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID],[Name],[Code],[JurisdictionType],[CountryCode],[StateProvinceCode],[IsActive])
  VALUES ('B1000001-0000-0000-0000-000000000009', N'Florida', N'US-FL', N'State', N'US', N'FL', 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'GB-UK')
  INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID],[Name],[Code],[JurisdictionType],[CountryCode],[StateProvinceCode],[IsActive])
  VALUES ('B1000001-0000-0000-0000-000000000010', N'United Kingdom', N'GB-UK', N'Country', N'GB', NULL, 1);

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'EU-REG')
  INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID],[Name],[Code],[JurisdictionType],[CountryCode],[StateProvinceCode],[IsActive])
  VALUES ('B1000001-0000-0000-0000-000000000011', N'European Union', N'EU-REG', N'International', N'EU', NULL, 1);

-- Resolve PracticeArea and Jurisdiction IDs into variables
DECLARE @PA_CORP UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'CORP_MA');
DECLARE @PA_LIT UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'COMM_LIT');
DECLARE @PA_EMP UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'EMP_LABOR');
DECLARE @PA_IP UNIQUEIDENTIFIER   = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IP_LAW');
DECLARE @PA_RE UNIQUEIDENTIFIER   = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'REAL_ESTATE');
DECLARE @PA_CLOUD UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_CLOUD_ARCH');
DECLARE @PA_CYBER UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_CYBER_SOC2');
DECLARE @PA_AI UNIQUEIDENTIFIER    = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_AI_LLM');
DECLARE @PA_DATA UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_DATA_ENG');
DECLARE @PA_ERP UNIQUEIDENTIFIER   = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_ERP_INT');
DECLARE @PA_TAX UNIQUEIDENTIFIER   = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'ACCT_TAX_RD');
DECLARE @PA_MED UNIQUEIDENTIFIER   = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'MED_INFORMATICS');

DECLARE @J_CA UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-CA');
DECLARE @J_NY UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-NY');
DECLARE @J_TX UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-TX');
DECLARE @J_DE UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-DE');
DECLARE @J_FED UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-FED');
DECLARE @J_MA UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-MA');
DECLARE @J_WA UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-WA');
DECLARE @J_IL UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-IL');
DECLARE @J_FL UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-FL');
DECLARE @J_UK UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'GB-UK');
DECLARE @J_EU UNIQUEIDENTIFIER  = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'EU-REG');

DECLARE @T_STD UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = N'STANDARD');
DECLARE @T_PRI UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = N'PRIORITY');
DECLARE @T_PRO UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = N'PRO_BONO');

-- 4. Seed Common Organizations & Persons
IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsCommon].[Organization] WHERE [ID] = '01000001-0000-0000-0000-000000000001')
  INSERT INTO [__mj_BizAppsCommon].[Organization] ([ID],[Name],[Status]) VALUES
    ('01000001-0000-0000-0000-000000000001', N'StratusCloud Partners LLP', N'Active'),
    ('01000001-0000-0000-0000-000000000002', N'Aegis ZeroTrust Advisory', N'Active'),
    ('01000001-0000-0000-0000-000000000003', N'VectorFoundry AI Labs', N'Active'),
    ('01000001-0000-0000-0000-000000000004', N'Lakehouse Systems Group', N'Active'),
    ('01000001-0000-0000-0000-000000000005', N'Meridian Tax & R&D CPAs', N'Active'),
    ('01000001-0000-0000-0000-000000000006', N'HealthBridge Informatics MD', N'Active');

-- 5. Seed 18 Additional Verified Professionals (total 24 across IT, Legal, Accounting, Medical)
DECLARE @Pros TABLE (
  ID UNIQUEIDENTIFIER, OrgID UNIQUEIDENTIFIER, DisplayName NVARCHAR(200), FirmName NVARCHAR(200),
  Email NVARCHAR(255), BarLic NVARCHAR(100), Verif NVARCHAR(30), Avail NVARCHAR(30),
  Bio NVARCHAR(MAX), Yrs INT, Langs NVARCHAR(255), MinR DECIMAL(10,2), MaxR DECIMAL(10,2),
  ProBono BIT, ActiveCnt INT, MaxCnt INT, AvgResp DECIMAL(6,2), AvgRat DECIMAL(3,2),
  AcceptedCnt INT, CompletedCnt INT, PA_ID UNIQUEIDENTIFIER, PA_Prof NVARCHAR(30),
  JUR_ID UNIQUEIDENTIFIER
);

INSERT INTO @Pros VALUES
('D2000001-0000-0000-0000-000000000101','01000001-0000-0000-0000-000000000001',N'Dr. Priya Subramanian',N'StratusCloud Partners LLP',N'priya.subramanian@stratuscloud.io',N'AWS-SAP-90412',N'Verified',N'Available',N'Principal Cloud Architect specializing in multi-region AWS/Azure landing zones, EKS/AKS migrations, and 40% FinOps spend reduction.',14,N'English, Tamil',275,425,0,2,8,1.2,4.95,28,24,@PA_CLOUD,N'Primary',@J_CA),
('D2000001-0000-0000-0000-000000000102','01000001-0000-0000-0000-000000000001',N'Marcus Thorne',N'StratusCloud Partners LLP',N'marcus.thorne@stratuscloud.io',N'AZURE-305-7721',N'Verified',N'Available',N'Cloud infrastructure & Terraform automation lead for regulated fintech and SaaS scale-ups.',11,N'English',250,375,0,3,10,1.8,4.82,19,16,@PA_CLOUD,N'Primary',@J_NY),
('D2000001-0000-0000-0000-000000000103','01000001-0000-0000-0000-000000000001',N'Devon Brooks',N'Cascade Cloud Guild',N'devon.brooks@cascadecloud.dev',N'GCP-PCA-4410',N'Verified',N'Limited',N'Kubernetes platform engineering, service mesh, and FinOps governance for high-throughput workloads.',9,N'English',225,340,1,4,6,2.4,4.78,15,12,@PA_CLOUD,N'Primary',@J_WA),
('D2000001-0000-0000-0000-000000000104','01000001-0000-0000-0000-000000000002',N'Elena Rostova, CISSP',N'Aegis ZeroTrust Advisory',N'elena.rostova@aegiszerotrust.com',N'CISSP-618290',N'Verified',N'Available',N'Former CISO guiding SaaS enterprises through SOC2 Type II, ISO 27001, FedRAMP, and zero-trust IAM rollouts.',16,N'English, Russian',325,495,0,2,8,0.9,4.96,34,31,@PA_CYBER,N'Primary',@J_FED),
('D2000001-0000-0000-0000-000000000105','01000001-0000-0000-0000-000000000002',N'Tariq Al-Mansoor, CISM',N'Aegis ZeroTrust Advisory',N'tariq@aegiszerotrust.com',N'CISM-339104',N'Verified',N'Available',N'Cloud penetration testing, red-team exercises, and DORA / GDPR security readiness across US and EU.',12,N'English, Arabic',290,420,0,1,7,1.4,4.89,22,20,@PA_CYBER,N'Primary',@J_EU),
('D2000001-0000-0000-0000-000000000106','01000001-0000-0000-0000-000000000002',N'Hannah Lindqvist',N'NordicSec Consulting',N'hannah@nordicsec.io',N'OSCP-88219',N'Verified',N'Available',N'Application security, SAST/DAST CI/CD hardening, and ransomware tabletop readiness.',8,N'English, Swedish',240,350,1,2,8,2.1,4.74,14,11,@PA_CYBER,N'Primary',@J_MA),
('D2000001-0000-0000-0000-000000000107','01000001-0000-0000-0000-000000000003',N'Dr. Kenji Takahashi',N'VectorFoundry AI Labs',N'kenji@vectorfoundry.ai',N'ML-ARCH-5012',N'Verified',N'Available',N'Enterprise RAG architectures, multi-agent orchestration, LLM eval harnesses, and EU AI Act compliance.',10,N'English, Japanese',350,525,0,3,6,1.1,4.94,25,22,@PA_AI,N'Primary',@J_CA),
('D2000001-0000-0000-0000-000000000108','01000001-0000-0000-0000-000000000003',N'Sofia Alvarez',N'VectorFoundry AI Labs',N'sofia.alvarez@vectorfoundry.ai',N'AI-GOV-2291',N'Verified',N'Available',N'Productionizing conversational AI copilots, prompt-injection defense, and Azure OpenAI private deployments.',7,N'English, Spanish',260,390,1,2,9,1.6,4.85,18,15,@PA_AI,N'Primary',@J_TX),
('D2000001-0000-0000-0000-000000000109','01000001-0000-0000-0000-000000000003',N'Liam O''Connor',N'Celtic AI Systems',N'liam@celticai.co.uk',N'UK-AI-7712',N'Verified',N'Available',N'Fine-tuning domain-specific language models and building deterministic agent guardrails for financial services.',9,N'English',280,410,0,1,6,2.0,4.81,12,10,@PA_AI,N'Primary',@J_UK),
('D2000001-0000-0000-0000-000000000110','01000001-0000-0000-0000-000000000004',N'Nadia Patel',N'Lakehouse Systems Group',N'nadia.patel@lakehousesystems.io',N'DBX-DE-4409',N'Verified',N'Available',N'Databricks Unity Catalog, Snowflake cost tuning, dbt mesh, and Kafka real-time CDC pipelines.',12,N'English, Gujarati',240,360,0,2,8,1.5,4.90,26,23,@PA_DATA,N'Primary',@J_IL),
('D2000001-0000-0000-0000-000000000111','01000001-0000-0000-0000-000000000004',N'Carlos Mendez',N'Lakehouse Systems Group',N'carlos@lakehousesystems.io',N'SF-ARCH-9910',N'Verified',N'Available',N'Enterprise BI migration from legacy SSRS/Oracle to Snowflake + dbt + semantic layer.',11,N'English, Spanish',220,330,0,2,8,2.3,4.76,17,15,@PA_DATA,N'Primary',@J_TX),
('D2000001-0000-0000-0000-000000000112','01000001-0000-0000-0000-000000000004',N'Rachel Kim',N'Bridgeway ERP Advisors',N'rachel.kim@bridgewayerp.com',N'NS-ERP-3104',N'Verified',N'Available',N'NetSuite-to-Salesforce quote-to-cash automation, ASC 606 rev-rec integrations, and M&A ERP consolidation.',13,N'English, Korean',250,380,0,3,7,1.9,4.88,21,19,@PA_ERP,N'Primary',@J_NY),
('D2000001-0000-0000-0000-000000000113','01000001-0000-0000-0000-000000000004',N'David Kowalski',N'Bridgeway ERP Advisors',N'dkowalski@bridgewayerp.com',N'SAP-INT-6502',N'Verified',N'Limited',N'SAP S/4HANA API gateway integration, EDI modernization, and warehouse automation.',15,N'English, Polish',265,395,0,4,6,3.1,4.72,16,14,@PA_ERP,N'Primary',@J_IL),
('D2000001-0000-0000-0000-000000000114','01000001-0000-0000-0000-000000000005',N'Arthur Pendelton, CPA',N'Meridian Tax & R&D CPAs',N'arthur@meridiancpas.com',N'CPA-CA-88210',N'Verified',N'Available',N'Section 174 R&D tax credit studies for software/AI companies and multi-state SaaS sales tax nexus.',18,N'English',300,450,0,2,8,1.7,4.91,29,27,@PA_TAX,N'Primary',@J_CA),
('D2000001-0000-0000-0000-000000000115','01000001-0000-0000-0000-000000000005',N'Miriam Goldstein, CPA',N'Meridian Tax & R&D CPAs',N'miriam@meridiancpas.com',N'CPA-NY-51903',N'Verified',N'Available',N'Cross-border transfer pricing, M&A tax due diligence, and QSBS Section 1202 structuring.',14,N'English, Hebrew',310,460,1,1,7,2.0,4.87,20,18,@PA_TAX,N'Primary',@J_NY),
('D2000001-0000-0000-0000-000000000116','01000001-0000-0000-0000-000000000006',N'Dr. Maya Lin, MD',N'HealthBridge Informatics MD',N'maya.lin@healthbridge.org',N'MD-MA-449102',N'Verified',N'Available',N'Board-certified clinical informaticist leading Epic/Cerner FHIR interoperability and HIPAA telehealth compliance.',12,N'English, Mandarin',340,480,1,1,6,1.3,4.93,18,17,@PA_MED,N'Primary',@J_MA),
('D2000001-0000-0000-0000-000000000117','01000001-0000-0000-0000-000000000006',N'Dr. Samuel Okafor, MD',N'HealthBridge Informatics MD',N's.okafor@healthbridge.org',N'MD-FL-771829',N'Verified',N'Available',N'Multi-state telemedicine licensing, remote patient monitoring protocols, and AI clinical triage governance.',11,N'English',315,445,0,2,8,2.2,4.84,15,13,@PA_MED,N'Primary',@J_FL),
('D2000001-0000-0000-0000-000000000118',NULL,N'Victoria Sterling, Esq.',N'Sterling Delaware Counsel',N'v.sterling@sterlingde.law',N'DE-BAR-55190',N'Verified',N'Available',N'Delaware corporate governance, Series A-C venture financings, and cross-border M&A transactions.',16,N'English, French',450,650,0,2,7,1.4,4.92,24,22,@PA_CORP,N'Primary',@J_DE);

INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile]
  ([ID],[OrganizationID],[DisplayName],[FirmName],[Email],[LicenseNumber],[VerificationStatus],[AvailabilityStatus],[Bio],[YearsExperience],[Languages],[HourlyRateMin],[HourlyRateMax],[AcceptsProBono],[AcceptsContingency],[ActiveReferralCount],[MaxConcurrentReferrals],[AverageResponseHours],[AverageRating],[TotalAcceptedCount],[TotalCompletedCount],[IsActive])
SELECT p.ID, p.OrgID, p.DisplayName, p.FirmName, p.Email, p.BarLic, p.Verif, p.Avail, p.Bio, p.Yrs, p.Langs, p.MinR, p.MaxR, p.ProBono, 0, p.ActiveCnt, p.MaxCnt, p.AvgResp, p.AvgRat, p.AcceptedCnt, p.CompletedCnt, 1
FROM @Pros p
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalProfile] existing WHERE existing.[ID] = p.ID);

INSERT INTO [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
  ([ID],[ProfessionalProfileID],[PracticeAreaID],[ProficiencyLevel],[YearsInPractice])
SELECT NEWID(), p.ID, p.PA_ID, p.PA_Prof, p.Yrs
FROM @Pros p
WHERE p.PA_ID IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ppa
    WHERE ppa.[ProfessionalProfileID] = p.ID AND ppa.[PracticeAreaID] = p.PA_ID
  );

INSERT INTO [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
  ([ID],[ProfessionalProfileID],[JurisdictionID],[StandingStatus])
SELECT NEWID(), p.ID, p.JUR_ID, N'GoodStanding'
FROM @Pros p
WHERE p.JUR_ID IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalJurisdiction] pj
    WHERE pj.[ProfessionalProfileID] = p.ID AND pj.[JurisdictionID] = p.JUR_ID
  );

-- 6. Seed 24 Rich Referral Requests across IT Consulting, Legal, Accounting, Medical & All Statuses
DECLARE @Reqs TABLE (
  ID UNIQUEIDENTIFIER, ReqNum NVARCHAR(50), SeekerName NVARCHAR(200), SeekerEmail NVARCHAR(255),
  SeekerCompany NVARCHAR(200), PA_ID UNIQUEIDENTIFIER, JUR_ID UNIQUEIDENTIFIER, TierID UNIQUEIDENTIFIER,
  MatterTitle NVARCHAR(255), MatterSummary NVARCHAR(MAX), Urgency NVARCHAR(20), Budget NVARCHAR(100),
  ProBono BIT, Status NVARCHAR(30), AssignedProID UNIQUEIDENTIFIER, CascadeStep INT,
  DaysAgoSub INT, DaysAgoAcc INT, DaysAgoComp INT
);

INSERT INTO @Reqs VALUES
('E2000001-0000-0000-0000-000000000101',N'REF-2026-0201',N'Jordan Vance',N'jvance@nexora.io',N'Nexora FinTech',@PA_CLOUD,@J_CA,@T_PRI,N'Multi-Region AWS EKS Migration & FinOps Audit',N'Migrating 42 microservices from legacy EC2 to multi-region EKS with Terraform and targeting 35% cloud spend reduction.',N'High',N'$45,000 - $75,000',0,N'Completed','D2000001-0000-0000-0000-000000000101',1,42,41,14),
('E2000001-0000-0000-0000-000000000102',N'REF-2026-0202',N'Alicia Chen',N'achen@veridianbio.com',N'Veridian BioLabs',@PA_CYBER,@J_FED,@T_PRI,N'SOC2 Type II + HIPAA Penetration Testing',N'Series B biotech preparing for enterprise hospital procurement; need SOC2 Type II gap remediation and external pen-test.',N'Urgent',N'$35,000 - $55,000',0,N'Completed','D2000001-0000-0000-0000-000000000104',1,38,38,10),
('E2000001-0000-0000-0000-000000000103',N'REF-2026-0203',N'Derek Holloway',N'dholloway@apexlogistics.com',N'Apex Logistics',@PA_AI,@J_CA,@T_PRI,N'Enterprise RAG Copilot for Customs Brokerage',N'Building a cited RAG assistant over 120k tariff and customs PDFs with strict hallucination evals and RBAC.',N'High',N'$60,000 - $95,000',0,N'InProgress','D2000001-0000-0000-0000-000000000107',1,22,21,NULL),
('E2000001-0000-0000-0000-000000000104',N'REF-2026-0204',N'Priya Nair',N'pnair@luminahealth.io',N'Lumina Health',@PA_DATA,@J_IL,@T_STD,N'Databricks Lakehouse & dbt Mesh Modernization',N'Consolidating 8 regional SQL Server instances into Databricks Unity Catalog with incremental dbt models.',N'Standard',N'$40,000 - $65,000',0,N'Accepted','D2000001-0000-0000-0000-000000000110',1,15,14,NULL),
('E2000001-0000-0000-0000-000000000105',N'REF-2026-0205',N'Samira Haddad',N'shaddad@kestrelcloud.com',N'Kestrel Cloud',@PA_ERP,@J_NY,@T_PRI,N'NetSuite to Salesforce Quote-to-Cash Sync',N'Automating subscription renewals, ASC 606 revenue recognition schedules, and bi-directional invoice sync.',N'High',N'$30,000 - $50,000',0,N'Completed','D2000001-0000-0000-0000-000000000112',1,35,34,7),
('E2000001-0000-0000-0000-000000000106',N'REF-2026-0206',N'Owen Gallagher',N'oweng@cobaltai.dev',N'Cobalt AI',@PA_AI,@J_TX,@T_STD,N'Azure OpenAI Private Endpoint & Guardrails',N'Deploying private GPT-4o endpoints with prompt-injection firewall and PII redaction for insurance claims.',N'Standard',N'$25,000 - $45,000',0,N'Routed',NULL,2,5,NULL,NULL),
('E2000001-0000-0000-0000-000000000107',N'REF-2026-0207',N'Claire Beaumont',N'cbeaumont@eurogrid.eu',N'EuroGrid Energy',@PA_CYBER,@J_EU,@T_PRI,N'NIS2 & DORA Zero-Trust IAM Architecture',N'Pan-European energy operator seeking zero-trust identity federation and incident response playbook.',N'Urgent',N'$50,000 - $85,000',0,N'Accepted','D2000001-0000-0000-0000-000000000105',2,12,11,NULL),
('E2000001-0000-0000-0000-000000000108',N'REF-2026-0208',N'Nathaniel Price',N'nprice@foundryrobotics.com',N'Foundry Robotics',@PA_CLOUD,@J_WA,@T_PRO,N'Nonprofit STEM Cloud Cost Optimization',N'501(c)(3) robotics education platform seeking pro-bono AWS Kubernetes cost reduction.',N'Low',N'Pro Bono',1,N'Completed','D2000001-0000-0000-0000-000000000103',1,48,47,20),
('E2000001-0000-0000-0000-000000000109',N'REF-2026-0209',N'Beatrice Morales',N'bmorales@solsticebank.com',N'Solstice Digital Bank',@PA_AI,@J_UK,@T_PRI,N'FCA-Compliant LLM Model Risk Governance',N'Independent validation and red-teaming of credit-underwriting assistant under UK FCA guidelines.',N'High',N'$55,000 - $90,000',0,N'InProgress','D2000001-0000-0000-0000-000000000109',1,19,18,NULL),
('E2000001-0000-0000-0000-000000000110',N'REF-2026-0210',N'Trevor Jenkins',N'tjenkins@midwestmfg.com',N'Midwest Manufacturing',@PA_ERP,@J_IL,@T_STD,N'SAP S/4HANA EDI & Warehouse API Bridge',N'Replacing legacy AS2/EDI scripts with RESTful SAP integration and real-time WMS inventory webhooks.',N'Standard',N'$35,000 - $60,000',0,N'Routed',NULL,1,4,NULL,NULL),
('E2000001-0000-0000-0000-000000000111',N'REF-2026-0211',N'Grace Liu',N'gliu@quantumleap.ai',N'QuantumLeap AI',@PA_TAX,@J_CA,@T_PRI,N'Section 174 R&D Tax Credit & Multi-State Nexus',N'Restating FY24/FY25 engineering R&D capitalization and filing amended federal/CA returns.',N'High',N'$18,000 - $30,000',0,N'Completed','D2000001-0000-0000-0000-000000000114',1,31,30,5),
('E2000001-0000-0000-0000-000000000112',N'REF-2026-0212',N'Evan Gallagher',N'egallagher@harborventures.com',N'Harbor Ventures',@PA_TAX,@J_NY,@T_STD,N'Cross-Border M&A Tax Due Diligence',N'Buy-side tax structuring and QSBS Section 1202 review for $45M SaaS acquisition.',N'High',N'$25,000 - $40,000',0,N'Accepted','D2000001-0000-0000-0000-000000000115',1,9,8,NULL),
('E2000001-0000-0000-0000-000000000113',N'REF-2026-0213',N'Dr. Monica Alvarez',N'malvarez@beaconclinic.org',N'Beacon Community Health',@PA_MED,@J_MA,@T_PRO,N'FHIR R4 EHR Interoperability & Telehealth Audit',N'Community health network needs FHIR R4 patient portal integration and HIPAA telehealth workflow review.',N'Standard',N'Pro Bono',1,N'Completed','D2000001-0000-0000-0000-000000000116',1,28,27,3),
('E2000001-0000-0000-0000-000000000114',N'REF-2026-0214',N'Kyle Anderson',N'kanderson@suncoastcare.com',N'Suncoast Care',@PA_MED,@J_FL,@T_STD,N'Multi-State Remote Patient Monitoring Rollout',N'Clinical governance and multi-state physician supervision protocols for cardiac RPM program.',N'High',N'$20,000 - $35,000',0,N'Routed',NULL,1,3,NULL,NULL),
('E2000001-0000-0000-0000-000000000115',N'REF-2026-0215',N'Sophia Rossi',N'srossi@ateliertech.io',N'Atelier Tech',@PA_CORP,@J_DE,@T_PRI,N'Delaware C-Corp Series B Preferred Financing',N'Lead counsel review of Series B term sheet, charter amendment, and investor rights agreement.',N'Urgent',N'$40,000 - $65,000',0,N'Completed','D2000001-0000-0000-0000-000000000118',1,25,25,2),
('E2000001-0000-0000-0000-000000000116',N'REF-2026-0216',N'Lucas Meyer',N'lmeyer@ironcladcloud.com',N'Ironclad Cloud',@PA_CLOUD,@J_NY,@T_STD,N'Azure Landing Zone & Private Link Hardening',N'Designing hub-and-spoke Azure networking with Private Link and Entra ID workload identities.',N'Standard',N'$28,000 - $42,000',0,N'Accepted','D2000001-0000-0000-0000-000000000102',1,11,10,NULL),
('E2000001-0000-0000-0000-000000000117',N'REF-2026-0217',N'Megan Foster',N'mfoster@citrusdata.co',N'Citrus Data',@PA_DATA,@J_TX,@T_STD,N'Snowflake FinOps & Kafka CDC Pipeline',N'Reducing Snowflake warehouse credits by 45% and replacing batch ETL with Debezium + Kafka.',N'Standard',N'$22,000 - $38,000',0,N'Matching',NULL,0,2,NULL,NULL),
('E2000001-0000-0000-0000-000000000118',N'REF-2026-0218',N'Noah Bennett',N'nbennett@vanguardsec.io',N'Vanguard Sec',@PA_CYBER,@J_MA,@T_STD,N'CI/CD Supply Chain Security & SBOM Pipeline',N'Implementing Sigstore artifact signing, SLSA Level 3 provenance, and automated container scanning.',N'High',N'$18,000 - $28,000',0,N'Submitted',NULL,0,1,NULL,NULL),
('E2000001-0000-0000-0000-000000000119',N'REF-2026-0219',N'Olivia Grant',N'ogrant@northstarretail.com',N'Northstar Retail',@PA_CLOUD,@J_CA,@T_STD,N'Legacy Oracle WebLogic to AWS ECS Modernization',N'Containerizing monolithic Java billing service and migrating to AWS ECS Fargate + Aurora PostgreSQL.',N'Standard',N'$50,000 - $80,000',0,N'Exhausted',NULL,3,18,NULL,NULL),
('E2000001-0000-0000-0000-000000000120',N'REF-2026-0220',N'Ethan Brooks',N'ebrooks@deltaops.ai',N'DeltaOps AI',@PA_AI,@J_CA,@T_PRI,N'Multi-Agent Support Triage Evaluation Suite',N'Building automated LLM-as-a-judge regression suite for 14 customer support tool-calling agents.',N'High',N'$30,000 - $50,000',0,N'Completed','D2000001-0000-0000-0000-000000000107',1,52,51,15),
('E2000001-0000-0000-0000-000000000121',N'REF-2026-0221',N'Zoe Campbell',N'zcampbell@pacificmed.org',N'Pacific Medical Group',@PA_CYBER,@J_CA,@T_PRI,N'Ransomware Tabletop & Active Directory Tiering',N'Executive tabletop exercise and AD Tier-0 isolation following regional healthcare security advisory.',N'Urgent',N'$32,000 - $48,000',0,N'Cancelled',NULL,1,40,NULL,NULL);

INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
  ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[SeekerCompany],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[BudgetRange],[PreferredLanguage],[RequiresProBono],[Status],[AssignedProfessionalID],[CurrentCascadeStep],[SubmittedAt],[AcceptedAt],[CompletedAt])
SELECT
  r.ID, r.ReqNum, r.SeekerName, r.SeekerEmail, r.SeekerCompany,
  r.PA_ID, r.JUR_ID, r.TierID, r.MatterTitle, r.MatterSummary,
  r.Urgency, r.Budget, N'English', r.ProBono, r.Status, r.AssignedProID, r.CascadeStep,
  DATEADD(DAY, -r.DaysAgoSub, SYSDATETIMEOFFSET()),
  CASE WHEN r.DaysAgoAcc IS NOT NULL THEN DATEADD(DAY, -r.DaysAgoAcc, SYSDATETIMEOFFSET()) ELSE NULL END,
  CASE WHEN r.DaysAgoComp IS NOT NULL THEN DATEADD(DAY, -r.DaysAgoComp, SYSDATETIMEOFFSET()) ELSE NULL END
FROM @Reqs r
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] existing WHERE existing.[RequestNumber] = r.ReqNum);

-- 7. Seed Referral Assignments (with realistic MatchScores, SLA response times, Conflict statuses)
DECLARE @Assigns TABLE (
  ID UNIQUEIDENTIFIER, ReqID UNIQUEIDENTIFIER, ProID UNIQUEIDENTIFIER,
  CascadeOrder INT, MatchScore DECIMAL(5,2), ConflictStatus NVARCHAR(30),
  Status NVARCHAR(30), OfferedDaysAgo INT, RespHoursAfter DECIMAL(6,2), Notes NVARCHAR(MAX)
);

INSERT INTO @Assigns VALUES
('F2000001-0000-0000-0000-000000000101','E2000001-0000-0000-0000-000000000101','D2000001-0000-0000-0000-000000000101',1,96.50,N'Cleared',N'Accepted',42,0.75,N'Immediate fit for EKS multi-region FinOps scope.'),
('F2000001-0000-0000-0000-000000000102','E2000001-0000-0000-0000-000000000102','D2000001-0000-0000-0000-000000000104',1,97.20,N'Cleared',N'Accepted',38,0.60,N'Cleared conflict check; scheduled kickoff within 24h.'),
('F2000001-0000-0000-0000-000000000103','E2000001-0000-0000-0000-000000000103','D2000001-0000-0000-0000-000000000107',1,94.80,N'Cleared',N'Accepted',22,1.25,N'RAG eval harness & customs PDF pipeline accepted.'),
('F2000001-0000-0000-0000-000000000104','E2000001-0000-0000-0000-000000000104','D2000001-0000-0000-0000-000000000110',1,91.40,N'Cleared',N'Accepted',15,2.10,N'Databricks Unity Catalog team available Monday.'),
('F2000001-0000-0000-0000-000000000105','E2000001-0000-0000-0000-000000000105','D2000001-0000-0000-0000-000000000112',1,95.00,N'Cleared',N'Accepted',35,1.50,N'NetSuite-Salesforce ASC 606 integration delivered.'),
('F2000001-0000-0000-0000-000000000106','E2000001-0000-0000-0000-000000000106','D2000001-0000-0000-0000-000000000107',1,86.30,N'Cleared',N'Declined',5,3.50,N'At capacity for Azure private deployments this sprint.'),
('F2000001-0000-0000-0000-000000000107','E2000001-0000-0000-0000-000000000106','D2000001-0000-0000-0000-000000000108',2,92.10,N'Cleared',N'Offered',4,NULL,N'Cascaded to Step 2 — awaiting pro SLA response.'),
('F2000001-0000-0000-0000-000000000108','E2000001-0000-0000-0000-000000000107','D2000001-0000-0000-0000-000000000104',1,88.00,N'ConflictFound',N'ConflictRejected',12,0.90,N'Adverse party overlap with existing utility client.'),
('F2000001-0000-0000-0000-000000000109','E2000001-0000-0000-0000-000000000107','D2000001-0000-0000-0000-000000000105',2,93.70,N'Cleared',N'Accepted',11,1.40,N'EU NIS2 & DORA specialist accepted at Step 2.'),
('F2000001-0000-0000-0000-000000000110','E2000001-0000-0000-0000-000000000108','D2000001-0000-0000-0000-000000000103',1,89.50,N'Cleared',N'Accepted',48,2.80,N'Pro-bono STEM cloud audit accepted.'),
('F2000001-0000-0000-0000-000000000111','E2000001-0000-0000-0000-000000000109','D2000001-0000-0000-0000-000000000109',1,91.80,N'Cleared',N'Accepted',19,1.90,N'FCA model risk governance accepted.'),
('F2000001-0000-0000-0000-000000000112','E2000001-0000-0000-0000-000000000110','D2000001-0000-0000-0000-000000000113',1,87.40,N'Cleared',N'Offered',4,NULL,N'Pending SAP integration lead review.'),
('F2000001-0000-0000-0000-000000000113','E2000001-0000-0000-0000-000000000111','D2000001-0000-0000-0000-000000000114',1,95.40,N'Cleared',N'Accepted',31,1.60,N'Section 174 R&D study accepted.'),
('F2000001-0000-0000-0000-000000000114','E2000001-0000-0000-0000-000000000112','D2000001-0000-0000-0000-000000000115',1,92.90,N'Cleared',N'Accepted',9,2.20,N'M&A tax due diligence kickoff scheduled.'),
('F2000001-0000-0000-0000-000000000115','E2000001-0000-0000-0000-000000000113','D2000001-0000-0000-0000-000000000116',1,96.10,N'Cleared',N'Accepted',28,0.85,N'Pro-bono FHIR R4 telehealth audit accepted.'),
('F2000001-0000-0000-0000-000000000116','E2000001-0000-0000-0000-000000000114','D2000001-0000-0000-0000-000000000117',1,90.20,N'Cleared',N'Offered',3,NULL,N'Pending physician lead confirmation.'),
('F2000001-0000-0000-0000-000000000117','E2000001-0000-0000-0000-000000000115','D2000001-0000-0000-0000-000000000118',1,97.80,N'Cleared',N'Accepted',25,0.70,N'Delaware Series B financing closed smoothly.'),
('F2000001-0000-0000-0000-000000000118','E2000001-0000-0000-0000-000000000116','D2000001-0000-0000-0000-000000000102',1,93.10,N'Cleared',N'Accepted',11,1.75,N'Azure Landing Zone engagement started.'),
('F2000001-0000-0000-0000-000000000119','E2000001-0000-0000-0000-000000000119','D2000001-0000-0000-0000-000000000101',1,74.20,N'Cleared',N'Expired',18,26.00,N'SLA window expired during holiday week.'),
('F2000001-0000-0000-0000-000000000120','E2000001-0000-0000-0000-000000000119','D2000001-0000-0000-0000-000000000102',2,68.50,N'Cleared',N'Declined',17,6.40,N'Outside primary AWS ECS specialty.'),
('F2000001-0000-0000-0000-000000000121','E2000001-0000-0000-0000-000000000119','D2000001-0000-0000-0000-000000000103',3,58.90,N'Cleared',N'Expired',16,28.00,N'Final cascade step expired; marked Exhausted.'),
('F2000001-0000-0000-0000-000000000122','E2000001-0000-0000-0000-000000000120','D2000001-0000-0000-0000-000000000107',1,95.60,N'Cleared',N'Accepted',52,1.10,N'Agent evaluation suite delivered ahead of schedule.');

INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
  ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ScoreBreakdownJSON],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[ResponseNotes])
SELECT
  a.ID, a.ReqID, a.ProID, a.CascadeOrder, a.MatchScore,
  N'{"practiceAreaMatch":40,"jurisdictionMatch":25,"slaScore":18,"ratingScore":12}',
  a.ConflictStatus, a.Status,
  DATEADD(DAY, -a.OfferedDaysAgo, SYSDATETIMEOFFSET()),
  DATEADD(HOUR, 24, DATEADD(DAY, -a.OfferedDaysAgo, SYSDATETIMEOFFSET())),
  CASE WHEN a.RespHoursAfter IS NOT NULL THEN DATEADD(MINUTE, CAST(a.RespHoursAfter * 60 AS INT), DATEADD(DAY, -a.OfferedDaysAgo, SYSDATETIMEOFFSET())) ELSE NULL END,
  a.Notes
FROM @Assigns a
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] existing WHERE existing.[ID] = a.ID);

-- 8. Seed Conflict Check Parties
DECLARE @Parties TABLE (ID UNIQUEIDENTIFIER, ReqID UNIQUEIDENTIFIER, Name NVARCHAR(255), Role NVARCHAR(30), Org NVARCHAR(255));
INSERT INTO @Parties VALUES
('C2000001-0000-0000-0000-000000000101','E2000001-0000-0000-0000-000000000101',N'Nexora FinTech Inc.',N'Client',N'Nexora FinTech'),
('C2000001-0000-0000-0000-000000000102','E2000001-0000-0000-0000-000000000102',N'Veridian BioLabs Inc.',N'Client',N'Veridian BioLabs'),
('C2000001-0000-0000-0000-000000000103','E2000001-0000-0000-0000-000000000107',N'EuroGrid Energy SA',N'Client',N'EuroGrid Energy'),
('C2000001-0000-0000-0000-000000000104','E2000001-0000-0000-0000-000000000107',N'NordStream Grid Partners',N'Adverse',N'NordStream Grid'),
('C2000001-0000-0000-0000-000000000105','E2000001-0000-0000-0000-000000000112',N'Harbor Ventures LLC',N'Client',N'Harbor Ventures'),
('C2000001-0000-0000-0000-000000000106','E2000001-0000-0000-0000-000000000112',N'CloudScale Metrics Corp.',N'RelatedEntity',N'CloudScale Metrics'),
('C2000001-0000-0000-0000-000000000107','E2000001-0000-0000-0000-000000000115',N'Atelier Tech Inc.',N'Client',N'Atelier Tech'),
('C2000001-0000-0000-0000-000000000108','E2000001-0000-0000-0000-000000000115',N'Redwood Growth Partners',N'CoParty',N'Redwood Growth');

INSERT INTO [__mj_BizAppsReferrals].[ConflictCheckParty]
  ([ID],[ReferralRequestID],[PartyName],[PartyRole],[OrganizationName],[NormalizedName])
SELECT p.ID, p.ReqID, p.Name, p.Role, p.Org, LOWER(REPLACE(p.Name, N'.', N''))
FROM @Parties p
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ConflictCheckParty] existing WHERE existing.[ID] = p.ID);

-- 9. Seed Referral Feedbacks (10 rich reviews across IT, Legal, Accounting, Medical)
DECLARE @Feedbacks TABLE (
  ID UNIQUEIDENTIFIER, ReqID UNIQUEIDENTIFIER, AssignID UNIQUEIDENTIFIER, ProID UNIQUEIDENTIFIER,
  SubType NVARCHAR(20), Rating INT, Outcome NVARCHAR(30), Comments NVARCHAR(MAX), DaysAgo INT
);

INSERT INTO @Feedbacks VALUES
('92000001-0000-0000-0000-000000000101','E2000001-0000-0000-0000-000000000101','F2000001-0000-0000-0000-000000000101','D2000001-0000-0000-0000-000000000101',N'Seeker',5,N'Resolved',N'Priya cut our AWS EKS bill by 38% and completed the multi-region failover drill ahead of schedule.',13),
('92000001-0000-0000-0000-000000000102','E2000001-0000-0000-0000-000000000102','F2000001-0000-0000-0000-000000000102','D2000001-0000-0000-0000-000000000104',N'Seeker',5,N'Resolved',N'Elena got us through SOC2 Type II + HIPAA pen-testing in 4 weeks with zero major findings.',9),
('92000001-0000-0000-0000-000000000103','E2000001-0000-0000-0000-000000000103','F2000001-0000-0000-0000-000000000103','D2000001-0000-0000-0000-000000000107',N'Seeker',5,N'Engaged',N'Kenji''s RAG citation accuracy hit 96% on our customs benchmark.',12),
('92000001-0000-0000-0000-000000000104','E2000001-0000-0000-0000-000000000105','F2000001-0000-0000-0000-000000000105','D2000001-0000-0000-0000-000000000112',N'Seeker',5,N'Resolved',N'Seamless NetSuite-to-Salesforce quote-to-cash sync; closed our month-end 3 days faster.',6),
('92000001-0000-0000-0000-000000000105','E2000001-0000-0000-0000-000000000108','F2000001-0000-0000-0000-000000000110','D2000001-0000-0000-0000-000000000103',N'Seeker',5,N'Resolved',N'Devon was generous with his time and saved our nonprofit $4k/mo on EKS.',19),
('92000001-0000-0000-0000-000000000106','E2000001-0000-0000-0000-000000000111','F2000001-0000-0000-0000-000000000113','D2000001-0000-0000-0000-000000000114',N'Seeker',5,N'Resolved',N'Arthur uncovered $280k in eligible R&D tax credits across our AI engineering team.',4),
('92000001-0000-0000-0000-000000000107','E2000001-0000-0000-0000-000000000113','F2000001-0000-0000-0000-000000000115','D2000001-0000-0000-0000-000000000116',N'Seeker',5,N'Resolved',N'Dr. Lin''s FHIR R4 audit was thorough and immediately actionable for our engineering team.',2),
('92000001-0000-0000-0000-000000000108','E2000001-0000-0000-0000-000000000115','F2000001-0000-0000-0000-000000000117','D2000001-0000-0000-0000-000000000118',N'Seeker',5,N'Resolved',N'Victoria closed our Series B cleanly on an aggressive 3-week timeline.',1),
('92000001-0000-0000-0000-000000000109','E2000001-0000-0000-0000-000000000120','F2000001-0000-0000-0000-000000000122','D2000001-0000-0000-0000-000000000107',N'Seeker',5,N'Resolved',N'Best AI eval harness engagement we have run.',14),
('92000001-0000-0000-0000-000000000110','E2000001-0000-0000-0000-000000000107','F2000001-0000-0000-0000-000000000109','D2000001-0000-0000-0000-000000000105',N'Operator',4,N'Engaged',N'Smooth cascade to Step 2 after conflict screening caught an adverse overlap.',10);

INSERT INTO [__mj_BizAppsReferrals].[ReferralFeedback]
  ([ID],[ReferralRequestID],[ReferralAssignmentID],[ProfessionalProfileID],[SubmittedByType],[Rating],[OutcomeStatus],[Comments],[SubmittedAt])
SELECT f.ID, f.ReqID, f.AssignID, f.ProID, f.SubType, f.Rating, f.Outcome, f.Comments, DATEADD(DAY, -f.DaysAgo, SYSDATETIMEOFFSET())
FROM @Feedbacks f
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralFeedback] existing WHERE existing.[ID] = f.ID);

-- 10. Seed 20 Normalized ProfessionalCredential records across IT, Legal, Accounting, and Medical
DECLARE @Creds TABLE (
  ID UNIQUEIDENTIFIER, ProID UNIQUEIDENTIFIER, JurID UNIQUEIDENTIFIER,
  Code NVARCHAR(100), Name NVARCHAR(255), Issuer NVARCHAR(255),
  ProviderKey NVARCHAR(100), ExtRef NVARCHAR(255), Status NVARCHAR(30),
  IsPrimary BIT, DaysValid INT
);

INSERT INTO @Creds VALUES
('82000001-0000-0000-0000-000000000101','D2000001-0000-0000-0000-000000000101',@J_CA,N'AWS-SAP-C02',N'AWS Certified Solutions Architect - Professional',N'Amazon Web Services',N'ExternalAction',N'AWS-SAP-99812',N'Verified',1,730),
('82000001-0000-0000-0000-000000000102','D2000001-0000-0000-0000-000000000101',@J_CA,N'CKA-2025',N'Certified Kubernetes Administrator',N'CNCF',N'Manual',N'CNCF-CKA-4410',N'Verified',0,540),
('82000001-0000-0000-0000-000000000103','D2000001-0000-0000-0000-000000000102',@J_NY,N'GCP-PCA-441',N'Google Cloud Professional Cloud Architect',N'Google Cloud',N'ExternalAction',N'GCP-PCA-441',N'Verified',1,600),
('82000001-0000-0000-0000-000000000104','D2000001-0000-0000-0000-000000000103',@J_TX,N'AZ-305-882',N'Microsoft Certified: Azure Solutions Architect Expert',N'Microsoft',N'Manual',N'MS-AZ305-882',N'Verified',1,365),
('82000001-0000-0000-0000-000000000105','D2000001-0000-0000-0000-000000000104',@J_FED,N'CISSP-77219',N'Certified Information Systems Security Professional',N'ISC2',N'ExternalAction',N'ISC2-77219',N'Verified',1,900),
('82000001-0000-0000-0000-000000000106','D2000001-0000-0000-0000-000000000104',@J_FED,N'OSCP-3110',N'Offensive Security Certified Professional',N'OffSec',N'Manual',N'OSCP-3110',N'Verified',0,720),
('82000001-0000-0000-0000-000000000107','D2000001-0000-0000-0000-000000000105',@J_EU,N'CISM-66104',N'Certified Information Security Manager',N'ISACA',N'ExternalAction',N'ISACA-66104',N'Verified',1,800),
('82000001-0000-0000-0000-000000000108','D2000001-0000-0000-0000-000000000106',@J_UK,N'CIPP-E-5012',N'Certified Information Privacy Professional / Europe',N'IAPP',N'Manual',NULL,N'Pending',1,365),
('82000001-0000-0000-0000-000000000109','D2000001-0000-0000-0000-000000000107',@J_CA,N'AWS-MLS-309',N'AWS Certified Machine Learning - Specialty',N'Amazon Web Services',N'ExternalAction',N'AWS-MLS-309',N'Verified',1,700),
('82000001-0000-0000-0000-000000000110','D2000001-0000-0000-0000-000000000108',@J_NY,N'DEEP-AI-114',N'Enterprise AI Governance & Safety Specialist',N'AI Standards Institute',N'Manual',NULL,N'Pending',1,365),
('82000001-0000-0000-0000-000000000111','D2000001-0000-0000-0000-000000000109',@J_DE,N'DB-DE-992',N'Databricks Certified Data Engineer Professional',N'Databricks',N'ExternalAction',N'DB-992',N'Verified',1,500),
('82000001-0000-0000-0000-000000000112','D2000001-0000-0000-0000-000000000110',@J_IL,N'SNOW-PRO-41',N'SnowPro Core & Advanced Architect',N'Snowflake',N'Manual',N'SNOW-41',N'Verified',1,450),
('82000001-0000-0000-0000-000000000113','D2000001-0000-0000-0000-000000000111',@J_WA,N'SF-CTA-881',N'Salesforce Certified Technical Architect',N'Salesforce',N'ExternalAction',N'SF-CTA-881',N'Verified',1,1095),
('82000001-0000-0000-0000-000000000114','D2000001-0000-0000-0000-000000000112',@J_NY,N'NS-ERP-204',N'Oracle NetSuite Certified ERP Consultant',N'Oracle NetSuite',N'Manual',N'NS-204',N'Verified',1,600),
('82000001-0000-0000-0000-000000000115','D2000001-0000-0000-0000-000000000113',@J_CA,N'CA-BAR-298410',N'State Bar of California License',N'State Bar of California',N'ExternalAction',N'CABAR-298410',N'Verified',1,1095),
('82000001-0000-0000-0000-000000000116','D2000001-0000-0000-0000-000000000114',@J_NY,N'CPA-NY-091283',N'New York Certified Public Accountant',N'NYSED Office of the Professions',N'BizAppsCredentialingBridge',N'NYCPA-091283',N'Verified',1,730),
('82000001-0000-0000-0000-000000000117','D2000001-0000-0000-0000-000000000115',@J_TX,N'CPA-TX-114902',N'Texas State Board of Public Accountancy CPA',N'TSBPA',N'Manual',NULL,N'Pending',1,365),
('82000001-0000-0000-0000-000000000118','D2000001-0000-0000-0000-000000000116',@J_MA,N'MD-MA-448210',N'Massachusetts Board of Registration in Medicine',N'Mass.gov BORIM',N'ExternalAction',N'BORIM-448210',N'Verified',1,730),
('82000001-0000-0000-0000-000000000119','D2000001-0000-0000-0000-000000000117',@J_FL,N'MD-FL-771829',N'Florida Board of Medicine License',N'Florida Department of Health',N'Manual',N'FLDOH-771829',N'Verified',1,730),
('82000001-0000-0000-0000-000000000120','D2000001-0000-0000-0000-000000000118',@J_DE,N'DE-BAR-55190',N'Delaware Supreme Court Bar Admission',N'Delaware Board of Bar Examiners',N'ExternalAction',N'DEBAR-55190',N'Verified',1,1095);

INSERT INTO [__mj_BizAppsReferrals].[ProfessionalCredential]
  ([ID],[ProfessionalProfileID],[JurisdictionID],[CredentialCode],[CredentialName],[IssuerName],[ProviderKey],[ExternalReferenceID],[VerificationStatus],[IssuedAt],[ExpiresAt],[VerifiedAt],[IsPrimary])
SELECT
  c.ID,
  c.ProID,
  c.JurID,
  c.Code,
  c.Name,
  c.Issuer,
  c.ProviderKey,
  c.ExtRef,
  c.Status,
  DATEADD(DAY, -180, SYSDATETIMEOFFSET()),
  DATEADD(DAY, c.DaysValid, SYSDATETIMEOFFSET()),
  CASE WHEN c.Status = N'Verified' THEN DATEADD(DAY, -30, SYSDATETIMEOFFSET()) ELSE NULL END,
  c.IsPrimary
FROM @Creds c
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalCredential] existing WHERE existing.[ID] = c.ID);

PRINT N'Referrals demo seed complete.';
GO
