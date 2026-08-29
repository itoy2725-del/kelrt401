import pool from './db';

interface UsomSettings {
  id: number;
  enabled: number;
  log_notify: number;
  target_domain: string | null;
  last_check: string | null;
  last_result: string | null;
  last_message_id: string | null;
  consecutive_hits: number;
  alerted: number;
}

export async function ensureUsomTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usom_settings (
      id INT PRIMARY KEY DEFAULT 1,
      enabled TINYINT DEFAULT 0,
      log_notify TINYINT DEFAULT 1,
      last_check DATETIME NULL,
      last_result VARCHAR(20) NULL,
      last_message_id VARCHAR(50) NULL,
      consecutive_hits INT DEFAULT 0,
      alerted TINYINT DEFAULT 0
    )
  `);
  try { await pool.query('ALTER TABLE usom_settings ADD COLUMN log_notify TINYINT DEFAULT 1'); } catch {}
  try { await pool.query('ALTER TABLE usom_settings ADD COLUMN target_domain VARCHAR(255) NULL'); } catch {}
  const [rows] = await pool.query('SELECT * FROM usom_settings WHERE id = 1') as any[];
  if (rows.length === 0) {
    await pool.query('INSERT INTO usom_settings (id, enabled) VALUES (1, 0)');
  }
}

export async function getUsomSettings(): Promise<UsomSettings> {
  await ensureUsomTable();
  const [rows] = await pool.query('SELECT * FROM usom_settings WHERE id = 1') as any[];
  return rows[0];
}

export async function updateUsomSettings(fields: Partial<UsomSettings>) {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'id') continue;
    sets.push(`${k} = ?`);
    vals.push(v);
  }
  if (sets.length === 0) return;
  await pool.query(`UPDATE usom_settings SET ${sets.join(', ')} WHERE id = 1`, vals);
}

function makePartialDomain(domain: string): string {
  domain = domain.toLowerCase().trim()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/[\/\?#].*$/, '');
  const parts = domain.split('.');

  const platformSuffixes = ['vercel.app','netlify.app','herokuapp.com','pages.dev','web.app','firebaseapp.com','onrender.com'];
  const ccTlds = ['tr','uk','br','au','jp','kr','cn','ru','de','fr','nl','za','mx','ar','in'];

  if (parts.length >= 3) {
    const suffix = parts.slice(-2).join('.');
    if (platformSuffixes.includes(suffix)) {
      const sub = parts.slice(0, -2).join('.');
      return sub.length > 2 ? sub.slice(0, -1) : sub;
    }
    if (ccTlds.includes(parts[parts.length - 1])) {
      const name = parts[0];
      const mid = parts[1];
      const partial = mid.length > 1 ? mid.slice(0, -1) : mid;
      return `${name}.${partial}`;
    }
  }
  if (parts.length >= 2) {
    const tld = parts[parts.length - 1];
    const name = parts[parts.length - 2];
    const partialTld = tld.length > 1 ? tld.slice(0, -1) : tld;
    return `${name}.${partialTld}`;
  }
  return domain.slice(0, -1);
}

function maskDomain(text: string): string {
  return text.replace(/\.([a-z]{2,10})\b/gi, '[.]$1');
}

async function queryUsom(searchTerm: string) {
  const params = new URLSearchParams({ q: searchTerm, 'per-page': '50' });
  const url = `https://siberguvenlik.gov.tr/api/address/index?${params}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 3000));
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const models = data.models ?? data;
      return { ok: true as const, data: Array.isArray(models) ? models : [], totalCount: data.totalCount ?? 0 };
    } catch {
      continue;
    }
  }
  return { ok: false as const, error: 'USOM API bağlantı hatası' };
}

function filterResultsForDomain(results: any[], domain: string): any[] {
  const base = domain.toLowerCase().replace(/^www\./, '').split('.')[0];
  return results.filter((item: any) => (item.url || '').toLowerCase().includes(base));
}

const BOT_TOKEN = '8833761305:AAGzA0xdVIpD_7otKw_3ElteNG2lcOQE4do';
const CHAT_ID = '-1003848607886';

async function sendTelegram(message: string): Promise<{ ok: boolean; messageId?: number }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    return { ok: data.ok, messageId: data.result?.message_id };
  } catch {
    return { ok: false };
  }
}

async function deleteTelegram(messageId: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, message_id: Number(messageId) }),
    });
  } catch {}
}

export async function runUsomCheck(domain: string, isTest = false, testDomain?: string) {
  const targetDomain = testDomain || domain;
  const searchTerm = makePartialDomain(targetDomain);
  const settings = await getUsomSettings();
  const now = new Date();

  const result = await queryUsom(searchTerm);

  if (!result.ok) {
    await updateUsomSettings({ last_check: now as any, last_result: 'error' });
    return { ok: false, domain: targetDomain, search: searchTerm, error: result.error };
  }

  const matched = filterResultsForDomain(result.data, targetDomain);
  const found = matched.length > 0;
  const maskedDomain = maskDomain(targetDomain);

  if (settings.last_message_id) {
    await deleteTelegram(settings.last_message_id);
  }

  let newConsecutive = found ? settings.consecutive_hits + 1 : 0;
  let newAlerted = found ? settings.alerted : 0;
  let newMessageId: string | null = null;

  const timeStr = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

  if (found) {
    const details = matched.slice(0, 5).map((m: any) =>
      `• ${maskDomain(m.url || 'N/A')} [${m.desc || ''}]`
    ).join('\n');

    if (newConsecutive >= 3 && !newAlerted) {
      newAlerted = 1;
      for (let i = 0; i < 3; i++) {
        const msg = `🚨 <b>USOM UYARI #${maskedDomain}</b>\n\n⚠️ <b>Site USOM listesinde bulundu!</b>\n🔍 Aranan: ${searchTerm}\n📊 Eşleşen: ${matched.length} kayıt\n\n${details}\n\n🕒 ${timeStr}`;
        const res = await sendTelegram(msg);
        if (res.ok && res.messageId) newMessageId = String(res.messageId);
        if (i < 2) await new Promise(r => setTimeout(r, 500));
      }
    } else {
      const prefix = isTest ? '🔍 <b>USOM TEST — Eşleşme Bulundu</b>' : '⚠️ <b>USOM KONTROL — Eşleşme Bulundu</b>';
      const msg = `${prefix}\n\n🌐 Domain: ${maskedDomain}\n🔍 Aranan: ${searchTerm}\n📊 Eşleşen: ${matched.length} kayıt\n${!isTest ? `⏳ Ardışık tespit: ${newConsecutive}/3\n` : ''}\n${details}\n\n🕒 ${timeStr}`;
      const res = await sendTelegram(msg);
      if (res.ok && res.messageId) newMessageId = String(res.messageId);
    }
  } else {
    const prefix = isTest ? '🔍 <b>USOM TEST — Temiz</b>' : '✅ <b>USOM Kontrolü Sağlandı</b>';
    const msg = `${prefix}\n\n🌐 Domain: ${maskedDomain}\n🔍 Aranan: ${searchTerm}\n📊 Sonuç: Temiz\n\n🕒 ${timeStr}`;
    const res = await sendTelegram(msg);
    if (res.ok && res.messageId) newMessageId = String(res.messageId);
  }

  await updateUsomSettings({
    last_check: now as any,
    last_result: found ? 'found' : 'clean',
    last_message_id: newMessageId,
    consecutive_hits: newConsecutive,
    alerted: newAlerted,
  });

  return { ok: true, domain: targetDomain, search: searchTerm, found, matched_count: matched.length, time: timeStr };
}
