# Database Migration & Deployment Guide

**Date:** March 01, 2026

## Overview

The E-Quipped application uses **Drizzle ORM** with MySQL for database management. This guide provides step-by-step instructions for setting up the database schema in a production environment.

## Database Schema

The application uses the following core tables:

| Table | Purpose |
| :--- | :--- |
| `users` | Stores user accounts with authentication info, role, and status |
| `modules` | Course modules containing lessons |
| `lessons` | Individual lessons within modules |
| `content_blocks` | Rich content (text, images, videos, code) within lessons |
| `courses` | Top-level courses containing modules |
| `quiz_questions` | Quiz questions associated with lessons |
| `quiz_attempts` | User quiz submission history and scores |
| `user_progress` | Tracks user progress through lessons |
| `sandbox_sessions` | AI sandbox chat sessions for hands-on learning |
| `sandbox_messages` | Chat messages within sandbox sessions |
| `prompt_library` | Saved AI prompts for reference |
| `stripe_payments` | Payment transaction records |
| `xp_events` | Experience point (XP) award history |
| `security_events` | Security audit logs |
| `access_requests` | User access requests for premium content |

## Migration Files

The database schema is managed through sequential migration files in the `/drizzle` directory:

| Migration | Description |
| :--- | :--- |
| `0000_common_hawkeye.sql` | Initial schema: users table |
| `0001_fixed_mantis.sql` | Content blocks, courses, lessons, modules, quiz tables |
| `0002_glamorous_domino.sql` | User progress and sandbox session tables |
| `0003_wet_exiles.sql` | Stripe payments table |
| `0004_eager_dragon_man.sql` | XP events table |
| `0005_daily_squadron_supreme.sql` | Security events and access requests tables |

## Pre-Deployment Checklist

Before running migrations in production, ensure the following:

- [ ] A MySQL 8.0+ database is provisioned (e.g., on Railway, TiDB Cloud, or a managed provider)
- [ ] The `DATABASE_URL` environment variable is set with the correct connection string
- [ ] The connection string format is: `mysql://username:password@host:port/database_name`
- [ ] The database user has permissions to create tables, indexes, and constraints
- [ ] A backup of any existing data has been created (if applicable)

## Running Migrations

### Option 1: Using Railway CLI (Recommended for Railway Deployments)

If deploying on Railway, use the Railway CLI to run migrations against the production database:

```bash
# Link your local project to the Railway deployment
railway link

# Run migrations against the production database
railway run pnpm db:push
```

This command will:
1. Generate the migration SQL from the schema definition
2. Apply all pending migrations to the production database

### Option 2: Manual Migration Execution

If you need to run migrations manually:

```bash
# Set the DATABASE_URL environment variable
export DATABASE_URL="mysql://user:password@host:port/database_name"

# Run the migration command
pnpm db:push
```

### Option 3: Using MySQL CLI Directly

You can also apply the migrations directly using the MySQL CLI:

```bash
# Connect to the database
mysql -h <host> -u <username> -p <database_name>

# Source each migration file in order
source drizzle/0000_common_hawkeye.sql;
source drizzle/0001_fixed_mantis.sql;
source drizzle/0002_glamorous_domino.sql;
source drizzle/0003_wet_exiles.sql;
source drizzle/0004_eager_dragon_man.sql;
source drizzle/0005_daily_squadron_supreme.sql;
```

## Post-Migration Verification

After running migrations, verify the schema was created correctly:

```bash
# Connect to the database
mysql -h <host> -u <username> -p <database_name>

# List all tables
SHOW TABLES;

# Verify the users table structure
DESCRIBE users;

# Check the total number of tables (should be 14)
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE();
```

Expected output should show 14 tables:
- users
- modules
- lessons
- courses
- content_blocks
- quiz_questions
- quiz_attempts
- user_progress
- sandbox_sessions
- sandbox_messages
- prompt_library
- stripe_payments
- xp_events
- security_events
- access_requests

## Seed Data (Optional)

The application includes seed data scripts for development and testing:

- `seed_content.mjs`: Populates the database with 7 modules and 37 lessons
- `backend/seed_data.py`: Legacy Python seed script (for reference only)

To seed the database with content:

```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="mysql://..."

# Run the seed script
node seed_content.mjs
```

## Troubleshooting

### Connection Error: "ECONNREFUSED"

**Cause:** The database is not reachable at the specified host/port.

**Solution:**
- Verify the `DATABASE_URL` is correct
- Check that the database server is running and accessible
- Ensure firewall rules allow connections from your deployment environment

### Error: "Access denied for user"

**Cause:** The database credentials are incorrect or the user lacks permissions.

**Solution:**
- Verify the username and password in the connection string
- Ensure the database user has `CREATE TABLE` and `ALTER TABLE` permissions
- Check that the database exists and is accessible

### Error: "Table already exists"

**Cause:** The migration has already been applied.

**Solution:**
- This is not an error; the migration system will skip already-applied migrations
- Check the `_drizzle_migrations` table to see which migrations have been applied

### Drizzle Kit Errors

If you encounter errors with `drizzle-kit`, ensure:

- The `drizzle.config.ts` file is correctly configured
- The `DATABASE_URL` environment variable is set
- The schema file at `drizzle/schema.ts` is valid TypeScript

## Rollback (Emergency Only)

If you need to rollback a migration (not recommended for production), you can manually drop tables in reverse order:

```sql
DROP TABLE IF EXISTS access_requests;
DROP TABLE IF EXISTS security_events;
DROP TABLE IF EXISTS xp_events;
DROP TABLE IF EXISTS stripe_payments;
DROP TABLE IF EXISTS sandbox_messages;
DROP TABLE IF EXISTS sandbox_sessions;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS prompt_library;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS content_blocks;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;
```

**Warning:** This will permanently delete all data. Always ensure backups are in place before performing a rollback.

## Next Steps

After successfully running migrations:

1. Verify all tables are created: `SHOW TABLES;`
2. Test the application's database connectivity
3. Monitor the application logs for any database-related errors
4. Set up regular database backups
5. Configure database monitoring and alerting

For more information on Drizzle ORM, visit: https://orm.drizzle.team/docs/overview
