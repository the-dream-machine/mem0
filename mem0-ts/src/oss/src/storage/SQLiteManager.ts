import { HistoryManager } from "./base";

/**
 * NOTE: sqlite3 is intentionally NOT imported at module top-level.
 * This file lazily requires sqlite3 inside the constructor so that
 * simply importing the module does NOT attempt to load the sqlite3
 * native binary. This prevents runtime errors in environments like
 * AWS Lambda when callers disable history (so the SQLite manager is
 * never instantiated).
 */

export class SQLiteManager implements HistoryManager {
  private db: any;

  constructor(dbPath: string) {
    // Lazy require to avoid loading sqlite3 on module import.
    // sqlite3 is only loaded when an instance is actually constructed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let sqlite3: any;
    try {
      // Try to require sqlite3 only when needed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      sqlite3 = require("sqlite3");
    } catch (err) {
      throw new Error(
        "sqlite3 module not found. To use the sqlite history provider install sqlite3 in your application (e.g. `npm install sqlite3`). Alternatively configure a different history provider or set `disableHistory: true`.",
      );
    }

    this.db = new sqlite3.Database(dbPath);
    this.init().catch(console.error);
  }

  private async init() {
    await this.run(`
      CREATE TABLE IF NOT EXISTS memory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        action TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT,
        is_deleted INTEGER DEFAULT 0
      )
    `);
  }

  private async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: any, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async addHistory(
    memoryId: string,
    previousValue: string | null,
    newValue: string | null,
    action: string,
    createdAt?: string,
    updatedAt?: string,
    isDeleted: number = 0,
  ): Promise<void> {
    await this.run(
      `INSERT INTO memory_history 
      (memory_id, previous_value, new_value, action, created_at, updated_at, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        memoryId,
        previousValue,
        newValue,
        action,
        createdAt,
        updatedAt,
        isDeleted,
      ],
    );
  }

  async getHistory(memoryId: string): Promise<any[]> {
    return this.all(
      "SELECT * FROM memory_history WHERE memory_id = ? ORDER BY id DESC",
      [memoryId],
    );
  }

  async reset(): Promise<void> {
    await this.run("DROP TABLE IF EXISTS memory_history");
    await this.init();
  }

  close(): void {
    try {
      this.db.close();
    } catch (e) {
      // ignore close errors
    }
  }
}
