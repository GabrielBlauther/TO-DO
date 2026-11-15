import { afterEach, beforeEach, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdtempSync, copyFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDatabase } from './database';
import { createHandler } from './api';
import { validDate, localToday, formatDate, periodRange, sessionInterval, overlaps } from '../shared/planning';

let db: Database;
let handle: ReturnType<typeof createHandler>;
beforeEach(() => { db = createDatabase(':memory:'); handle = createHandler(db); });
afterEach(() => db.close());
async function request(path: string, method = 'GET', data?: unknown) {
  const res = await handle(new Request(`http://localhost/api${path}`, { method, ...(data === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) }));
  return { status: res.status, data: await res.json() as any };
}
const addTask = async (extra = {}) => (await request('/tasks', 'POST', { title: 'Atividade de teste', ...extra })).data;
const addSession = (id: number, extra = {}) => request(`/tasks/${id}/sessions`, 'POST', { planned_date: '2026-06-30', start_time: null, duration_minutes: 50, ...extra });

test('datas civis, ano bissexto e formatação não deslocam o dia', () => {
  expect(validDate('2024-02-29')).toBe(true); expect(validDate('2026-02-29')).toBe(false);
  for (const d of ['2026-04-31', '2026-13-01', '2026-1-01', 'invalida']) expect(validDate(d)).toBe(false);
  expect(formatDate('2026-06-30')).toBe('30/06/2026');
  expect(localToday(new Date(2026, 5, 30, 23, 59))).toBe('2026-06-30');
});
test('períodos têm limites inclusivos e semestre civil, inclusive fevereiro bissexto', () => {
  expect(periodRange('semester', '2026-06-30')).toEqual({ start: '2026-01-01', end: '2026-06-30' });
  expect(periodRange('semester', '2026-07-01')).toEqual({ start: '2026-07-01', end: '2026-12-31' });
  expect(periodRange('month', '2024-02-10')).toEqual({ start: '2024-02-01', end: '2024-02-29' });
  expect(periodRange('today', '2026-12-31')).toEqual({ start: '2026-12-31', end: '2026-12-31' });
  expect(() => periodRange('custom', '', '2026-07-01', '2026-06-30')).toThrow();
});
test('instalação nova e reinicialização não duplicam exemplos nem recriam tarefas removidas', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'todo-restart-')), 'test.db');
  let disk = createDatabase(file); expect(disk.query('SELECT * FROM tasks').all()).toHaveLength(10);
  disk.close(); disk = createDatabase(file); expect(disk.query('SELECT * FROM tasks').all()).toHaveLength(10);
  disk.exec('DELETE FROM tasks'); disk.close(); disk = createDatabase(file);
  expect(disk.query('SELECT * FROM tasks').all()).toHaveLength(0); disk.close();
});
test('migração preserva integralmente a cópia do banco antigo e é repetível', () => {
  // LEGACY_DB points only to an isolated old-schema copy, never the original.
  const file = join(mkdtempSync(join(tmpdir(), 'todo-migration-')), 'test.db');
  if (Bun.env.LEGACY_DB) copyFileSync(Bun.env.LEGACY_DB, file);
  let disk = new Database(file);
  if (!Bun.env.LEGACY_DB) {
    disk.exec(readFileSync(new URL('./legacy-schema.sql', import.meta.url), 'utf8'));
    disk.exec(`INSERT INTO priorities VALUES(2,'Média',2,'P');
      INSERT INTO categories VALUES(1,'Estudo','E');
      INSERT INTO tasks(id,title,description,priority_id,category_id,status,due_date) VALUES(42,'Legada','Preservar',2,1,'in_progress','2026-06-30');
      INSERT INTO comments(id,task_id,text) VALUES(99,42,'Comentário legado');`);
  }
  const before = Object.fromEntries(['tasks','comments','priorities','categories'].map(table => [table, disk.query(`SELECT * FROM ${table} ORDER BY id`).all() as Record<string, unknown>[]]));
  disk.close(); disk = createDatabase(file);
  for (const [table, rows] of Object.entries(before)) {
    const after = disk.query(`SELECT * FROM ${table} ORDER BY id`).all() as Record<string, unknown>[];
    expect(after.map(row => Object.fromEntries(Object.keys(rows[0] || {}).map(key => [key, row[key]])))).toEqual(rows);
  }
  expect(disk.query('SELECT * FROM subjects').all()).toEqual([]);
  expect(disk.query('SELECT * FROM study_sessions').all()).toEqual([]);
  const subject = (disk.query("INSERT INTO subjects(name) VALUES ('IHC') RETURNING id").get() as any).id;
  const tid = (disk.query('SELECT id FROM tasks LIMIT 1').get() as any).id;
  disk.query('UPDATE tasks SET subject_id=? WHERE id=?').run(subject,tid);
  disk.query("INSERT INTO study_sessions(task_id,planned_date,duration_minutes) VALUES (?,'2026-06-30',80)").run(tid);
  disk.close(); disk = createDatabase(file);
  expect(disk.query('SELECT * FROM subjects').all()).toHaveLength(1);
  expect(disk.query('SELECT * FROM study_sessions').all()).toHaveLength(1);
  expect((disk.query('SELECT subject_id FROM tasks WHERE id=?').get(tid) as any).subject_id).toBe(subject);
  disk.close();
});
test('disciplina opcional, cadastro, duplicação e referências inválidas', async () => {
  expect((await request('/subjects','POST',{ name: ' ' })).status).toBe(400);
  const subject = (await request('/subjects','POST',{ name: 'Cálculo' })).data;
  expect((await request('/subjects','POST',{ name: 'Cálculo' })).status).toBe(409);
  const task = await addTask({ subject_id: subject.id }); expect(task.subject_name).toBe('Cálculo');
  expect((await request(`/tasks/${task.id}`,'PUT',{ subject_id: null, due_date: null })).data.subject_id).toBeNull();
  expect((await request('/tasks','POST',{ title: 'x', subject_id: 999 })).status).toBe(400);
});
test('atividade com várias sessões aparece uma vez, filtrando planejamento e não prazo', async () => {
  const task = await addTask({ due_date: '2026-12-31' });
  await addSession(task.id); await addSession(task.id); await addSession(task.id, { planned_date: '2026-07-01' });
  const result = await request('/tasks?start=2026-06-30&end=2026-07-01');
  expect(result.data.map((t: any) => t.id)).toEqual([task.id]);
  expect(result.data[0].sessions).toHaveLength(3);
  expect((await request('/tasks?start=2026-12-31&end=2026-12-31')).data).toEqual([]);
  expect((await request('/tasks?unplanned=true')).data.some((t: any) => t.id === task.id)).toBe(false);
});
test('filtro inclui exatamente os limites e rejeita datas e intervalos inválidos', async () => {
  for (const date of ['2026-06-29','2026-06-30','2026-07-01','2026-07-02']) await addSession((await addTask({ title: date })).id,{ planned_date: date });
  expect((await request('/tasks?start=2026-06-30&end=2026-07-01')).data.map((t: any) => t.title).sort()).toEqual(['2026-06-30','2026-07-01']);
  for (const query of ['start=2026-02-30&end=2026-03-01','start=2026-07-01&end=2026-06-30','start=2026-07-01']) expect((await request('/tasks?'+query)).status).toBe(400);
});
test('sessões sem horário coexistem; duração, data e horário são validados', async () => {
  const id = (await addTask()).id;
  expect((await addSession(id)).status).toBe(201); expect((await addSession(id)).status).toBe(201);
  for (const data of [{ duration_minutes: 0 },{ duration_minutes: -1 },{ duration_minutes: 1.5 },{ duration_minutes: '25' },{ planned_date: '2026-02-30' },{ start_time: '24:00' }]) expect((await addSession(id,data)).status).toBe(400);
});
test('conflitos globais, horários consecutivos e edição da própria sessão', async () => {
  const a = (await addTask()).id, b = (await addTask()).id;
  const first = (await addSession(a,{ start_time: '10:00', duration_minutes: 60 })).data.sessions[0];
  expect((await addSession(b,{ start_time: '10:59' })).status).toBe(409);
  expect((await addSession(b,{ start_time: '11:00' })).status).toBe(201);
  expect((await request(`/tasks/${a}/sessions/${first.id}`,'PUT',{ duration_minutes: 60 })).status).toBe(200);
  expect((await request(`/tasks/${a}/sessions/${first.id}`,'PUT',{ duration_minutes: 61 })).status).toBe(409);
  expect((await request(`/tasks/${a}`)).data.sessions[0].duration_minutes).toBe(60);
});
test('sobreposição atravessando meia-noite é detectada, intervalo consecutivo permitido', async () => {
  const id = (await addTask()).id;
  await addSession(id,{ start_time: '23:30', duration_minutes: 90 });
  expect((await addSession(id,{ planned_date: '2026-07-01', start_time: '00:30' })).status).toBe(409);
  expect((await addSession(id,{ planned_date: '2026-07-01', start_time: '01:00' })).status).toBe(201);
  expect(overlaps(sessionInterval('2026-06-30','23:30',90)!,sessionInterval('2026-07-01','01:00',30)!)).toBe(false);
});
test('estudo após prazo exige confirmação, reagendamento e remoção preservam atividade/prazo', async () => {
  const t = await addTask({ due_date: '2026-06-30' });
  expect((await addSession(t.id,{ planned_date: '2026-07-01' })).status).toBe(422);
  expect((await request(`/tasks/${t.id}`)).data.sessions).toEqual([]);
  const s = (await addSession(t.id,{ planned_date: '2026-07-01',confirm_after_due:true })).data.sessions[0];
  const edited = await request(`/tasks/${t.id}/sessions/${s.id}`,'PUT',{ planned_date:'2026-06-29' });
  expect(edited.data.due_date).toBe('2026-06-30');
  expect((await request(`/tasks/${t.id}`,'PUT',{due_date:'2026-06-28'})).status).toBe(422);
  expect((await request(`/tasks/${t.id}`,'PUT',{due_date:'2026-06-28',confirm_after_due:true})).status).toBe(200);
  await request(`/tasks/${t.id}/sessions/${s.id}`,'DELETE');
  expect((await request('/tasks?unplanned=true')).data.some((row:any)=>row.id===t.id)).toBe(true);
});
test('vínculos entre sessões e atividades, status, comentários e exclusão em cascata', async () => {
  const a = await addTask(), b = await addTask(); const s = (await addSession(a.id)).data.sessions[0];
  expect((await request(`/tasks/${b.id}/sessions/${s.id}`,'DELETE')).status).toBe(404);
  expect((await request(`/tasks/${a.id}/status`,'PATCH',{status:'done'})).data.status).toBe('done');
  await request(`/tasks/${a.id}/comments`,'POST',{text:'Teste'});
  expect((await request(`/tasks/${a.id}/comments`)).data).toHaveLength(1);
  await request(`/tasks/${a.id}`,'DELETE');
  expect(db.query('SELECT * FROM comments WHERE task_id=?').all(a.id)).toEqual([]);
  expect(db.query('SELECT * FROM study_sessions WHERE task_id=?').all(a.id)).toEqual([]);
  expect((await request(`/tasks/${b.id}`)).status).toBe(200);
});
