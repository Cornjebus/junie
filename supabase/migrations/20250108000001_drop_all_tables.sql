-- Drop All Tables Migration (Clean Slate)
-- Created: 2025-01-08
-- Description: Drops all existing Junie tables for a fresh start
-- ⚠️ WARNING: This will delete ALL data in these tables!

-- Drop tables in reverse dependency order to avoid foreign key errors
DROP TABLE IF EXISTS ai_costs CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS artifact_templates CASCADE;
DROP TABLE IF EXISTS path_templates CASCADE;
DROP TABLE IF EXISTS embeddings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS artifacts CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing helper functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS search_similar_paths(vector, integer) CASCADE;
DROP FUNCTION IF EXISTS search_embeddings(uuid, vector, integer) CASCADE;

-- Success message
SELECT 'All Junie tables and functions dropped successfully' AS status;
