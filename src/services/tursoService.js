/**
 * =========================================================
 * TURSO CLOUD SQLITE SERVICE (LIBSQL)
 * Real-time Multi-Device Synchronization for SmartEval
 * =========================================================
 */

import { createClient } from '@libsql/client/web';

const TURSO_URL = 'https://smarteval-db-iyan12-code.aws-ap-northeast-1.turso.io';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY3OTE2MTYsImlkIjoiMDFhMDA1MTEtZWEwMS03MjA1LTk1NzAtYzBiYjkwOTc4NWI2Iiwia2lkIjoiNWk0dG5mQllOdDJ5MG9nWXEzejdKRXNUb0hRakpoS3pHT28ycGI3NmJibyIsInJpZCI6ImYzNDBiMDk0LWNlYWItNGZiYy05NzA4LWI3ZWUxZDk5OTk1ZCJ9.hdeT1gSd9Ubk95wNDNAHerLIdA9q0dKC90ICbMIyt0OYafoqTfBpeTdJAIc1IhQB3YaZbfT-RXe4afAuAK4VAg';

let client = null;

export function getTursoClient() {
  if (!client) {
    client = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

/**
 * Inisialisasi Tabel di Turso Cloud SQLite
 */
export async function initTursoDb() {
  try {
    const db = getTursoClient();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_assessments (
        user_email TEXT PRIMARY KEY,
        state_json TEXT,
        updated_at TEXT
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS registered_users (
        email TEXT PRIMARY KEY,
        user_json TEXT,
        updated_at TEXT
      );
    `);
  } catch (err) {
    console.warn("Turso init error (offline fallback active):", err);
  }
}

/**
 * Menyimpan seluruh data asesmen pengguna ke Turso Cloud SQLite
 */
export async function saveAssessmentToTurso(userEmail, stateData) {
  if (!userEmail) return;
  try {
    const db = getTursoClient();
    const cleanEmail = userEmail.toLowerCase().trim();
    const payloadJson = JSON.stringify({
      exam: stateData.exam,
      students: stateData.students,
      answerKeys: stateData.answerKeys,
      questionMaterials: stateData.questionMaterials,
      questionIndicators: stateData.questionIndicators,
      questionKDs: stateData.questionKDs,
      questionLevels: stateData.questionLevels,
      history: stateData.history,
    });

    await db.execute({
      sql: `INSERT INTO user_assessments (user_email, state_json, updated_at) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_email) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`,
      args: [cleanEmail, payloadJson, new Date().toISOString()]
    });
    console.log(`[Turso Cloud Sync] Saved assessment for ${cleanEmail}`);
  } catch (err) {
    console.warn("[Turso Cloud Sync] Save error (saved to local):", err);
  }
}

/**
 * Mengambil data asesmen pengguna dari Turso Cloud SQLite
 */
export async function loadAssessmentFromTurso(userEmail) {
  if (!userEmail) return null;
  try {
    const db = getTursoClient();
    const cleanEmail = userEmail.toLowerCase().trim();
    const result = await db.execute({
      sql: `SELECT state_json FROM user_assessments WHERE user_email = ?`,
      args: [cleanEmail]
    });

    if (result.rows && result.rows.length > 0 && result.rows[0].state_json) {
      const parsed = JSON.parse(result.rows[0].state_json);
      console.log(`[Turso Cloud Sync] Loaded assessment from cloud for ${cleanEmail}`);
      return parsed;
    }
  } catch (err) {
    console.warn("[Turso Cloud Sync] Load error:", err);
  }
  return null;
}

/**
 * Menyimpan data akun pengguna ke Turso Cloud
 */
export async function saveUserToTurso(user) {
  if (!user || !user.email) return;
  try {
    const db = getTursoClient();
    const cleanEmail = user.email.toLowerCase().trim();
    await db.execute({
      sql: `INSERT INTO registered_users (email, user_json, updated_at) 
            VALUES (?, ?, ?) 
            ON CONFLICT(email) DO UPDATE SET user_json = excluded.user_json, updated_at = excluded.updated_at`,
      args: [cleanEmail, JSON.stringify(user), new Date().toISOString()]
    });
  } catch (err) {
    console.warn("[Turso Cloud Sync] User save error:", err);
  }
}

/**
 * Mengambil seluruh daftar pengguna terdaftar dari Turso Cloud
 */
export async function loadUsersFromTurso() {
  try {
    const db = getTursoClient();
    const result = await db.execute(`SELECT user_json FROM registered_users`);
    if (result.rows && result.rows.length > 0) {
      return result.rows.map(row => JSON.parse(row.user_json)).filter(u => u && u.email);
    }
  } catch (err) {
    console.warn("[Turso Cloud Sync] Load users error:", err);
  }
  return [];
}
