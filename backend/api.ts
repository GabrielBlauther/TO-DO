import type { Database } from 'bun:sqlite';
import { validDate, sessionInterval, overlaps } from '../shared/planning';

class HttpError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const headers = {
  'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
const selectTask = `SELECT t.*, c.name category_name, c.emoji category_emoji,
  p.name priority_name, p.level priority_level, p.emoji priority_emoji, s.name subject_name
  FROM tasks t JOIN categories c ON c.id=t.category_id
  JOIN priorities p ON p.id=t.priority_id LEFT JOIN subjects s ON s.id=t.subject_id`;
type Session = { id: number; task_id: number; planned_date: string; start_time: string | null; duration_minutes: number };

export function createHandler(db: Database) {
  const sessions = (id: number) => db.query('SELECT * FROM study_sessions WHERE task_id=? ORDER BY planned_date, start_time, id').all(id);
  const task = (id: number) => {
    const row = db.query(`${selectTask} WHERE t.id=?`).get(id) as Record<string, any> | null;
    if (!row) throw new HttpError('Atividade não encontrada.', 404);
    return { ...row, sessions: sessions(id) };
  };
  function reference(table: 'subjects' | 'priorities' | 'categories', id: unknown) {
    if (!Number.isSafeInteger(id) || !db.query(`SELECT id FROM ${table} WHERE id=?`).get(id as number)) throw new HttpError('Disciplina, prioridade ou categoria inválida.');
  }
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    try {
      const url = new URL(req.url), path = url.pathname, method = req.method;
      const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await req.json().catch(() => { throw new HttpError('Não foi possível ler os dados enviados.'); }) : {};
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError('Dados inválidos.');
      if (path === '/api/tasks' && method === 'GET') {
        const start = url.searchParams.get('start'), end = url.searchParams.get('end'), unplanned = url.searchParams.get('unplanned') === 'true';
        if ((start !== null || end !== null) && (!validDate(start) || !validDate(end) || start > end)) throw new HttpError('Informe um intervalo de datas válido, com início até o fim.');
        if (unplanned && start) throw new HttpError('Escolha um período ou Sem planejamento.');
        const where = unplanned ? 'WHERE NOT EXISTS (SELECT 1 FROM study_sessions ss WHERE ss.task_id=t.id)'
          : start ? 'WHERE EXISTS (SELECT 1 FROM study_sessions ss WHERE ss.task_id=t.id AND ss.planned_date BETWEEN ? AND ?)' : '';
        const rows = db.query(`${selectTask} ${where} ORDER BY p.level, t.due_date, t.id`).all(...(start ? [start, end!] : [])) as { id: number }[];
        return json(rows.map(row => ({ ...row, sessions: sessions(row.id) })));
      }
      const taskMatch = path.match(/^\/api\/tasks\/(\d+)$/);
      if (taskMatch && method === 'GET') return json(task(Number(taskMatch[1])));
      if ((path === '/api/tasks' && method === 'POST') || (taskMatch && method === 'PUT')) {
        const old = taskMatch ? task(Number(taskMatch[1])) : {} as Record<string, any>;
        const data = { title: '', description: '', priority_id: 2, category_id: 1, subject_id: null, status: 'todo', due_date: null, ...old, ...body };
        if (typeof data.title !== 'string' || !data.title.trim()) throw new HttpError('Informe o título da atividade.');
        if (typeof data.description !== 'string') throw new HttpError('Descrição inválida.');
        if (!['todo','in_progress','done'].includes(data.status)) throw new HttpError('Situação inválida.');
        data.due_date = data.due_date || null;
        if (data.due_date !== null && !validDate(data.due_date)) throw new HttpError('Informe um prazo válido.');
        reference('priorities', data.priority_id); reference('categories', data.category_id);
        if (data.subject_id !== null) reference('subjects', data.subject_id);
        if (old.id && data.due_date && (old.sessions as Session[]).some(s => s.planned_date > data.due_date) && body.confirm_after_due !== true) throw new HttpError('Há estudo planejado após este prazo. Revise ou confirme conscientemente para salvar.', 422);
        const args = [data.title.trim(), data.description, data.priority_id, data.category_id, data.subject_id, data.status, data.due_date];
        let id = old.id;
        if (id) db.query("UPDATE tasks SET title=?, description=?, priority_id=?, category_id=?, subject_id=?, status=?, due_date=?, updated_at=datetime('now') WHERE id=?").run(...args, id);
        else id = Number((db.query('INSERT INTO tasks (title,description,priority_id,category_id,subject_id,status,due_date) VALUES (?,?,?,?,?,?,?) RETURNING id').get(...args) as { id: number }).id);
        return json(task(id), old.id ? 200 : 201);
      }
      const statusMatch = path.match(/^\/api\/tasks\/(\d+)\/status$/);
      if (statusMatch && method === 'PATCH') {
        const id = Number(statusMatch[1]); task(id);
        if (!['todo','in_progress','done'].includes(body.status)) throw new HttpError('Situação inválida.');
        db.query("UPDATE tasks SET status=?, updated_at=datetime('now') WHERE id=?").run(body.status, id);
        return json(task(id));
      }
      if (taskMatch && method === 'DELETE') {
        const id = Number(taskMatch[1]); task(id); db.query('DELETE FROM tasks WHERE id=?').run(id); return json({ success: true });
      }
      if (path === '/api/subjects' && method === 'GET') return json(db.query('SELECT * FROM subjects ORDER BY name COLLATE NOCASE').all());
      if (path === '/api/subjects' && method === 'POST') {
        if (typeof body.name !== 'string' || !body.name.trim()) throw new HttpError('Informe o nome da disciplina.');
        if (db.query('SELECT id FROM subjects WHERE name=? COLLATE NOCASE').get(body.name.trim())) throw new HttpError('Já existe uma disciplina com esse nome.', 409);
        return json(db.query('INSERT INTO subjects (name) VALUES (?) RETURNING *').get(body.name.trim()), 201);
      }
      const listMatch = path.match(/^\/api\/tasks\/(\d+)\/sessions$/), sessionMatch = path.match(/^\/api\/tasks\/(\d+)\/sessions\/(\d+)$/);
      if (listMatch || sessionMatch) {
        const id = Number((listMatch || sessionMatch)![1]), parent = task(id), sid = sessionMatch ? Number(sessionMatch[2]) : null;
        const existing = sid ? db.query('SELECT * FROM study_sessions WHERE id=? AND task_id=?').get(sid, id) as Session | null : null;
        if (sid && !existing) throw new HttpError('Sessão não encontrada nesta atividade.', 404);
        if (listMatch && method === 'GET') return json(parent.sessions);
        if ((listMatch && method === 'POST') || (sessionMatch && method === 'PUT')) {
          const data = { ...existing, ...body }, time = data.start_time === '' || data.start_time === undefined ? null : data.start_time;
          if (time !== null && typeof time !== 'string') throw new HttpError('Horário inválido.');
          const interval = sessionInterval(data.planned_date, time, data.duration_minutes);
          if (interval) {
            const others = db.query('SELECT ss.*, t.title FROM study_sessions ss JOIN tasks t ON t.id=ss.task_id WHERE ss.start_time IS NOT NULL AND ss.id != ?').all(sid || 0) as (Session & { title: string })[];
            const conflict = others.find(other => overlaps(interval, sessionInterval(other.planned_date, other.start_time, other.duration_minutes)!));
            if (conflict) throw new HttpError(`Conflito com "${conflict.title}" em ${conflict.planned_date} às ${conflict.start_time}. Escolha outro horário ou cancele.`, 409);
          }
          if (parent.due_date && data.planned_date > parent.due_date && body.confirm_after_due !== true) throw new HttpError('O estudo está após o prazo da atividade. Revise ou confirme conscientemente para salvar.', 422);
          const args = [data.planned_date, time, data.duration_minutes];
          if (sid) db.query('UPDATE study_sessions SET planned_date=?,start_time=?,duration_minutes=? WHERE id=? AND task_id=?').run(...args, sid, id);
          else db.query('INSERT INTO study_sessions (planned_date,start_time,duration_minutes,task_id) VALUES (?,?,?,?)').run(...args, id);
          return json(task(id), sid ? 200 : 201);
        }
        if (sessionMatch && method === 'DELETE') {
          db.query('DELETE FROM study_sessions WHERE id=? AND task_id=?').run(sid!, id); return json(task(id));
        }
      }
      const commentsMatch = path.match(/^\/api\/tasks\/(\d+)\/comments$/);
      if (commentsMatch) {
        const id = Number(commentsMatch[1]); task(id);
        if (method === 'GET') return json(db.query('SELECT * FROM comments WHERE task_id=? ORDER BY created_at DESC,id DESC').all(id));
        if (method === 'POST') {
          if (typeof body.text !== 'string' || !body.text.trim()) throw new HttpError('Escreva um comentário.');
          return json(db.query('INSERT INTO comments (task_id,text) VALUES (?,?) RETURNING *').get(id,body.text.trim()), 201);
        }
      }
      const commentMatch = path.match(/^\/api\/comments\/(\d+)$/);
      if (commentMatch && method === 'DELETE') { db.query('DELETE FROM comments WHERE id=?').run(Number(commentMatch[1])); return json({ success: true }); }
      if (path === '/api/categories' && method === 'GET') return json(db.query('SELECT * FROM categories ORDER BY name').all());
      if (path === '/api/priorities' && method === 'GET') return json(db.query('SELECT * FROM priorities ORDER BY level').all());
      return json({ error: 'Caminho não encontrado.' }, 404);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      if (error instanceof Error && /Informe|duração/.test(error.message)) return json({ error: error.message }, 400);
      console.error(error); return json({ error: 'Não foi possível salvar ou consultar os dados. Tente novamente.' }, 500);
    }
  };
}
