// Thin wrapper around @vercel/postgres. The Postgres integration (added via
// the Vercel project's Storage tab) injects POSTGRES_URL and friends into
// the environment automatically, so `sql` just works in both local dev
// (via `vercel env pull`) and in production.
import { sql } from "@vercel/postgres";

export { sql };

// Idempotent schema bootstrap. Cheap to run (`IF NOT EXISTS` everywhere),
// called once per cold start by routes that touch the DB so a fresh
// database (or a brand new serverless region) always has the tables it
// needs without a separate manual migration step.
let schemaReady = null;

export async function ensureSchema() {
    if (schemaReady) return schemaReady;
    schemaReady = (async () => {
          await sql`
                CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                                email TEXT UNIQUE NOT NULL,
                                        password_hash TEXT NOT NULL,
                                                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                                                      )
                                                          `;
          await sql`
                CREATE TABLE IF NOT EXISTS documents (
                        id TEXT PRIMARY KEY,
                                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        data JSONB NOT NULL,
                                                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                                                      )
                                                          `;
          await sql`CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id)`;
          await sql`
                CREATE TABLE IF NOT EXISTS user_meta (
                        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                key TEXT NOT NULL,
                                        value JSONB NOT NULL,
                                                PRIMARY KEY (user_id, key)
                                                      )
                                                          `;
    })();
    return schemaReady;
}
