import { Database } from "bun:sqlite";

const db = new Database("todo.db", { create: true });

// Enable WAL mode for better performance
db.exec("PRAGMA journal_mode = WAL;");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    emoji TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS priorities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL,
    emoji TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority_id INTEGER NOT NULL DEFAULT 2,
    category_id INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (priority_id) REFERENCES priorities(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

// Seed priorities
const priorityCount = db.query("SELECT COUNT(*) as count FROM priorities").get() as { count: number };
if (priorityCount.count === 0) {
  const insertPriority = db.prepare("INSERT INTO priorities (name, level, emoji) VALUES (?, ?, ?)");
  insertPriority.run("Alta", 1, "🔴");
  insertPriority.run("Média", 2, "🟡");
  insertPriority.run("Baixa", 3, "🟢");
}

// Seed categories
const categoryCount = db.query("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare("INSERT INTO categories (name, emoji) VALUES (?, ?)");
  insertCategory.run("Trabalho", "💼");
  insertCategory.run("Pessoal", "🏠");
  insertCategory.run("Estudo", "📚");
  insertCategory.run("Saúde", "🏃");
  insertCategory.run("Finanças", "💰");
  insertCategory.run("Projeto", "🚀");
}

// Seed tasks (10 example tasks)
const taskCount = db.query("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
if (taskCount.count === 0) {
  const insertTask = db.prepare(
    "INSERT INTO tasks (title, description, priority_id, category_id, status, due_date) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertComment = db.prepare(
    "INSERT INTO comments (task_id, text) VALUES (?, ?)"
  );

  // Tasks: A Fazer
  insertTask.run("Preparar apresentação do projeto", "Criar slides e roteiro para a reunião de segunda-feira com o cliente.", 1, 1, "todo", "2026-05-25");
  insertTask.run("Estudar TypeScript avançado", "Revisar generics, utility types e decorators.", 2, 3, "todo", "2026-05-28");
  insertTask.run("Pagar conta de luz", "Vencimento dia 30. Verificar valor no app do banco.", 1, 5, "todo", "2026-05-30");
  insertTask.run("Comprar presente de aniversário", "Aniversário da Maria é dia 02/06. Verificar lista de desejos.", 3, 2, "todo", "2026-06-01");

  // Tasks: Em Progresso
  insertTask.run("Desenvolver API de autenticação", "Implementar JWT com refresh tokens e middleware de autorização.", 1, 6, "in_progress", "2026-05-26");
  insertTask.run("Fazer exercícios diários", "30 minutos de cardio + alongamento. Manter consistência.", 2, 4, "in_progress", "2026-05-23");
  insertTask.run("Ler livro Clean Code", "Capítulos 5-8 sobre formatação e objetos.", 3, 3, "in_progress", "2026-06-05");

  // Tasks: Concluídas
  insertTask.run("Configurar ambiente de desenvolvimento", "Instalar Node, Bun, VS Code extensions e configurar ESLint.", 2, 1, "done", "2026-05-20");
  insertTask.run("Criar wireframes do app", "Desenhar telas principais no Figma: login, dashboard e perfil.", 1, 6, "done", "2026-05-18");
  insertTask.run("Consulta médica anual", "Check-up completo com exames de sangue.", 2, 4, "done", "2026-05-15");

  // Seed some comments
  insertComment.run(1, "Lembrar de incluir métricas do último trimestre.");
  insertComment.run(1, "Cliente pediu foco em resultados de conversão.");
  insertComment.run(5, "Usar bcrypt para hash de senhas.");
  insertComment.run(5, "Verificar biblioteca jose para JWT.");
  insertComment.run(8, "Tudo configurado e funcionando!");
}

export default db;
