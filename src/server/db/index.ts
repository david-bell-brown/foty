import { drizzle } from "drizzle-orm/neon-http";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env } from "~/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: NeonQueryFunction<false, false>;
};

const sql = globalForDb.conn ?? neon(env.DATABASE_URL);
if (process.env.NODE_ENV !== "production") globalForDb.conn = sql;

export const db = drizzle(sql, { schema });
