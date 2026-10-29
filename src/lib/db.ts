import { Pool, type PoolClient } from "pg";

const globalForPool = globalThis as unknown as { argiPool?: Pool };

export function pool(): Pool {
  if (!globalForPool.argiPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL fehlt");
    globalForPool.argiPool = new Pool({ connectionString: url, max: 5 });
  }
  return globalForPool.argiPool;
}

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(sql, params);
  return res.rows as T[];
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("BEGIN");
    const out = await fn(c);
    await c.query("COMMIT");
    return out;
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
