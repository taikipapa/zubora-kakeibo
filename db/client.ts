import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { runInitialMigration } from './migrations/001_initial';

const DATABASE_NAME = 'zubora-kakeibo.db';

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await runInitialMigration(db);
  return db;
}

export function initDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (!initPromise) {
    initPromise = openAndMigrate().then((db) => {
      dbInstance = db;
      return db;
    });
  }
  return initPromise;
}

export function getDatabase(): SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Database has not been initialized. Call initDatabase() first.');
  }
  return dbInstance;
}
