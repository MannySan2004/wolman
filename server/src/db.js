import { readFileSync } from "node:fs";
import pg from "pg";

// Connection settings come from the standard PG* env vars.
export const pool = new pg.Pool({
  ssl: {
    ca: readFileSync(new URL("../certs/rds-global-bundle.pem", import.meta.url)),
    // Through the local tunnel PGHOST is 127.0.0.1, so verify the cert against the real RDS hostname.
    servername: process.env.RDS_HOST,
  },
});
