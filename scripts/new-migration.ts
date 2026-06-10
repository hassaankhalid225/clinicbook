/**
 * Creates a new migration from the diff between the live database and
 * schema.prisma — the Supabase-safe workflow (no shadow database needed).
 *
 *   1. Edit prisma/schema.prisma
 *   2. npm run migrate:new -- add_some_feature
 *   3. Review the generated SQL, then: npm run migrate:deploy
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const name = process.argv[2]?.replace(/[^a-z0-9_]/gi, "_") ?? "migration";
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
const dir = join("prisma", "migrations", `${stamp}_${name}`);

mkdirSync(dir, { recursive: true });
const sql = execSync(
  "npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script",
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
);
writeFileSync(join(dir, "migration.sql"), sql);

const size = statSync(join(dir, "migration.sql")).size;
console.log(`Created ${dir}/migration.sql (${size} bytes)`);
console.log("Review the SQL, then run: npm run migrate:deploy");
