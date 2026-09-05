import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { StoredProject } from "@/lib/portfolio";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

function open() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "jfmcss.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      position INTEGER PRIMARY KEY,
      tag      TEXT NOT NULL DEFAULT '',
      tag_en   TEXT NOT NULL DEFAULT '',
      title    TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      descr    TEXT NOT NULL DEFAULT '',
      descr_en TEXT NOT NULL DEFAULT '',
      img      TEXT NOT NULL DEFAULT ''
    )
  `);
  return db;
}

// una sola conexión por proceso (sobrevive el hot-reload de next dev)
const g = globalThis as unknown as { __jfmcssDb?: ReturnType<typeof open> };
function getDb() {
  return (g.__jfmcssDb ??= open());
}

export function getProjects(): StoredProject[] {
  const rows = getDb()
    .prepare("SELECT * FROM projects ORDER BY position")
    .all() as Array<Record<string, string>>;
  return rows.map((r) => ({
    tag: r.tag,
    tagEn: r.tag_en,
    title: r.title,
    titleEn: r.title_en,
    desc: r.descr,
    descEn: r.descr_en,
    img: r.img,
  }));
}

export function saveProjects(list: StoredProject[]) {
  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO projects (position, tag, tag_en, title, title_en, descr, descr_en, img)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  db.transaction(() => {
    db.prepare("DELETE FROM projects").run();
    list.forEach((p, i) => {
      insert.run(
        i,
        p.tag ?? "",
        p.tagEn ?? "",
        p.title ?? "",
        p.titleEn ?? "",
        p.desc ?? "",
        p.descEn ?? "",
        p.img ?? "",
      );
    });
  })();
}
