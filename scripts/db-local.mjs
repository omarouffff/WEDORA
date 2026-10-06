// Starts a real PostgreSQL server locally (no system install required).
// Data lives OUTSIDE the repo (OneDrive-synced folders corrupt live DB files):
//   %USERPROFILE%/.wedora-pgdata   (override with LOCAL_PG_DIR)
// Usage: `npm run db:local`
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = path.resolve(process.env.LOCAL_PG_DIR ?? path.join(os.homedir(), ".wedora-pgdata"));
const port = Number(process.env.LOCAL_PG_PORT ?? 54329);
const database = "wedora";
const initialised = fs.existsSync(path.join(dataDir, "PG_VERSION"));

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "wedora",
  password: "wedora",
  port,
  persistent: true,
  initdbFlags: ["--locale=C", "--encoding=UTF8", "--no-sync"],
});

if (!initialised) {
  await pg.initialise();
}
await pg.start();
if (!initialised) {
  await pg.createDatabase(database);
}

console.log(
  `\nPostgreSQL ready: postgresql://wedora:wedora@localhost:${port}/${database}\n` +
    `Data dir: ${dataDir}\n` +
    "Leave this process running. Press Ctrl+C to stop.\n",
);

const shutdown = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
