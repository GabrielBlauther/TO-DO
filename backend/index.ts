import db from "./database";

const PORT = 3001;

// Helper to parse JSON body
async function parseBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

// CORS headers
function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

// Routes
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // ===== TASKS =====

    // GET /api/tasks - List all tasks
    if (path === "/api/tasks" && method === "GET") {
      const tasks = db.query(`
        SELECT t.*, 
               c.name as category_name, c.emoji as category_emoji,
               p.name as priority_name, p.level as priority_level, p.emoji as priority_emoji
        FROM tasks t
        JOIN categories c ON t.category_id = c.id
        JOIN priorities p ON t.priority_id = p.id
        ORDER BY p.level ASC, t.due_date ASC
      `).all();
      return json(tasks);
    }

    // GET /api/tasks/:id - Get single task
    const taskMatch = path.match(/^\/api\/tasks\/(\d+)$/);
    if (taskMatch && method === "GET") {
      const id = parseInt(taskMatch[1]);
      const task = db.query(`
        SELECT t.*, 
               c.name as category_name, c.emoji as category_emoji,
               p.name as priority_name, p.level as priority_level, p.emoji as priority_emoji
        FROM tasks t
        JOIN categories c ON t.category_id = c.id
        JOIN priorities p ON t.priority_id = p.id
        WHERE t.id = ?
      `).get(id);
      if (!task) return json({ error: "Task not found" }, 404);
      return json(task);
    }

    // POST /api/tasks - Create task
    if (path === "/api/tasks" && method === "POST") {
      const body = await parseBody(req);
      const { title, description, priority_id, category_id, status, due_date } = body;
      if (!title) return json({ error: "Title is required" }, 400);

      const result = db.query(
        "INSERT INTO tasks (title, description, priority_id, category_id, status, due_date) VALUES (?, ?, ?, ?, ?, ?) RETURNING *"
      ).get(
        title,
        description || "",
        priority_id || 2,
        category_id || 1,
        status || "todo",
        due_date || null
      );
      return json(result, 201);
    }

    // PUT /api/tasks/:id - Update task
    if (taskMatch && method === "PUT") {
      const id = parseInt(taskMatch[1]);
      const body = await parseBody(req);
      const { title, description, priority_id, category_id, status, due_date } = body;

      const existing = db.query("SELECT * FROM tasks WHERE id = ?").get(id);
      if (!existing) return json({ error: "Task not found" }, 404);

      db.query(`
        UPDATE tasks SET 
          title = ?, description = ?, priority_id = ?, category_id = ?, 
          status = ?, due_date = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(
        title ?? (existing as any).title,
        description ?? (existing as any).description,
        priority_id ?? (existing as any).priority_id,
        category_id ?? (existing as any).category_id,
        status ?? (existing as any).status,
        due_date ?? (existing as any).due_date,
        id
      );

      const updated = db.query(`
        SELECT t.*, 
               c.name as category_name, c.emoji as category_emoji,
               p.name as priority_name, p.level as priority_level, p.emoji as priority_emoji
        FROM tasks t
        JOIN categories c ON t.category_id = c.id
        JOIN priorities p ON t.priority_id = p.id
        WHERE t.id = ?
      `).get(id);
      return json(updated);
    }

    // PATCH /api/tasks/:id/status - Update task status
    const statusMatch = path.match(/^\/api\/tasks\/(\d+)\/status$/);
    if (statusMatch && method === "PATCH") {
      const id = parseInt(statusMatch[1]);
      const body = await parseBody(req);
      const { status } = body;
      if (!status || !["todo", "in_progress", "done"].includes(status)) {
        return json({ error: "Invalid status" }, 400);
      }
      db.query("UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
      const updated = db.query(`
        SELECT t.*, 
               c.name as category_name, c.emoji as category_emoji,
               p.name as priority_name, p.level as priority_level, p.emoji as priority_emoji
        FROM tasks t
        JOIN categories c ON t.category_id = c.id
        JOIN priorities p ON t.priority_id = p.id
        WHERE t.id = ?
      `).get(id);
      return json(updated);
    }

    // DELETE /api/tasks/:id - Delete task
    if (taskMatch && method === "DELETE") {
      const id = parseInt(taskMatch[1]);
      const existing = db.query("SELECT * FROM tasks WHERE id = ?").get(id);
      if (!existing) return json({ error: "Task not found" }, 404);
      db.query("DELETE FROM tasks WHERE id = ?").run(id);
      return json({ success: true });
    }

    // ===== COMMENTS =====

    // GET /api/tasks/:id/comments
    const commentsMatch = path.match(/^\/api\/tasks\/(\d+)\/comments$/);
    if (commentsMatch && method === "GET") {
      const taskId = parseInt(commentsMatch[1]);
      const comments = db.query("SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC").all(taskId);
      return json(comments);
    }

    // POST /api/tasks/:id/comments
    if (commentsMatch && method === "POST") {
      const taskId = parseInt(commentsMatch[1]);
      const body = await parseBody(req);
      const { text } = body;
      if (!text) return json({ error: "Text is required" }, 400);

      const result = db.query(
        "INSERT INTO comments (task_id, text) VALUES (?, ?) RETURNING *"
      ).get(taskId, text);
      return json(result, 201);
    }

    // DELETE /api/comments/:id
    const commentDeleteMatch = path.match(/^\/api\/comments\/(\d+)$/);
    if (commentDeleteMatch && method === "DELETE") {
      const id = parseInt(commentDeleteMatch[1]);
      db.query("DELETE FROM comments WHERE id = ?").run(id);
      return json({ success: true });
    }

    // ===== CATEGORIES & PRIORITIES =====

    if (path === "/api/categories" && method === "GET") {
      const categories = db.query("SELECT * FROM categories ORDER BY name").all();
      return json(categories);
    }

    if (path === "/api/priorities" && method === "GET") {
      const priorities = db.query("SELECT * FROM priorities ORDER BY level").all();
      return json(priorities);
    }

    // 404
    return json({ error: "Not found" }, 404);
  },
});

console.log(`🚀 Backend running at http://localhost:${PORT}`);
