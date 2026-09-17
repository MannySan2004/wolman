import { readFileSync } from "node:fs";
import { pool } from "../src/db.js";

const sql = readFileSync(new URL("../db/app-schema.sql", import.meta.url), "utf8");
await pool.query(sql);
await pool.end();
console.log("App schema applied.");
