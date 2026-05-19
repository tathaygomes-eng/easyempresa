const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './data/database.sqlite';
const fullPath = path.resolve(__dirname, '..', '..', dbPath);

// Garantir que o diretorio data existe
const dir = path.dirname(fullPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

let dbInstance = null;

async function initDb() {
    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs();

    // Carregar banco existente ou criar novo
    if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        dbInstance = new SQL.Database(fileBuffer);
    } else {
        dbInstance = new SQL.Database();
    }

    // Habilitar foreign keys
    dbInstance.run('PRAGMA foreign_keys = ON;');

    return dbInstance;
}

function saveDb() {
    if (!dbInstance) return;
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(fullPath, buffer);
}

function getDb() {
    return dbInstance;
}

module.exports = { initDb, getDb, saveDb };
