/**
 * Workspace Jarvis HUD — Google Apps Script
 * Cole este conteúdo no Apps Script vinculado à sua planilha do Google Sheets.
 * Publique como Aplicativo da Web e use a URL /exec no index.html.
 */

const SHEET_NAME = 'Tarefas';

// Se o script estiver vinculado à planilha, deixe vazio.
// Se usar um projeto Apps Script separado, cole aqui o ID da planilha.
const SPREADSHEET_ID = '';

const HEADERS = [
  'id',
  'nome',
  'descricao',
  'categoria',
  'status',
  'recorrencia',
  'proxima_data',
  'data_criacao',
  'data_atualizacao'
];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'ping') {
      return jsonOutput_({ ok: true, app: 'Workspace Jarvis HUD', timestamp: new Date().toISOString() });
    }
    const tarefas = readTasks_();
    return jsonOutput_({ ok: true, tarefas, count: tarefas.length, timestamp: new Date().toISOString() });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    const tarefas = Array.isArray(payload) ? payload : payload.tarefas;
    if (!Array.isArray(tarefas)) throw new Error('Payload inválido: envie { tarefas: [...] }.');
    saveTasks_(tarefas);
    return jsonOutput_({ ok: true, count: tarefas.length, timestamp: new Date().toISOString() });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim()) return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Nenhuma planilha ativa. Vincule o script a uma planilha ou informe SPREADSHEET_ID.');
  return ss;
}

function getOrCreateSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((h, i) => String(firstRow[i] || '').trim() === h);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function readTasks_() {
  const sheet = getOrCreateSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const task = {};
      HEADERS.forEach((header, index) => task[header] = normalizeCell_(row[index]));
      task.id = Number(task.id) || Date.now() + Math.floor(Math.random() * 1000);
      task.status = task.status === 'Concluido' || task.status === 'Concluído' ? 'Concluido' : 'A Fazer';
      task.recorrencia = parseRecurrence_(task.recorrencia);
      task.proxima_data = normalizeDateOnly_(task.proxima_data);
      task.data_criacao = task.data_criacao || new Date().toISOString();
      task.data_atualizacao = task.data_atualizacao || new Date().toISOString();
      return task;
    });
}

function saveTasks_(tarefas) {
  const sheet = getOrCreateSheet_();
  const now = new Date().toISOString();
  const rows = tarefas.map(t => {
    const task = t || {};
    return [
      task.id || Date.now() + Math.floor(Math.random() * 1000),
      task.nome || '',
      task.descricao || '',
      task.categoria || '',
      task.status === 'Concluido' || task.status === 'Concluído' ? 'Concluido' : 'A Fazer',
      JSON.stringify(parseRecurrence_(task.recorrencia)),
      normalizeDateOnly_(task.proxima_data || ''),
      task.data_criacao || task.created_at || now,
      task.data_atualizacao || task.updated_at || now
    ];
  });

  const maxRows = Math.max(sheet.getLastRow() - 1, 0);
  if (maxRows > 0) sheet.getRange(2, 1, maxRows, HEADERS.length).clearContent();
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);

  sheet.autoResizeColumns(1, HEADERS.length);
}

function parseRecurrence_(value) {
  if (!value) return { ativa: false, tipo: '' };
  if (typeof value === 'object') return { ativa: !!value.ativa, tipo: String(value.tipo || '') };
  try {
    const parsed = JSON.parse(String(value));
    return { ativa: !!parsed.ativa, tipo: String(parsed.tipo || '') };
  } catch (err) {
    return { ativa: false, tipo: '' };
  }
}

function normalizeCell_(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeDateOnly_(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : text;
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
