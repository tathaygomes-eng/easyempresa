const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const isVercel = !!process.env.VERCEL;
const dbPath = process.env.DB_PATH || './data/database.sqlite';
const fullPath = path.resolve(__dirname, '..', '..', dbPath);

// Em Vercel, usar /tmp para escrita (ephemeral)
const writablePath = isVercel ? '/tmp/database.sqlite' : fullPath;

// Garantir que o diretorio data existe (apenas em dev)
if (!isVercel) {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

let dbInstance = null;

async function initDb() {
    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs();

    // Em Vercel: tentar copiar DB existente para /tmp se existir
    if (isVercel && fs.existsSync(fullPath) && !fs.existsSync(writablePath)) {
        try {
            const fileBuffer = fs.readFileSync(fullPath);
            fs.writeFileSync(writablePath, Buffer.from(fileBuffer));
        } catch (e) {
            // Ignorar erro de copia
        }
    }

    // Carregar banco existente ou criar novo
    if (fs.existsSync(writablePath)) {
        const fileBuffer = fs.readFileSync(writablePath);
        dbInstance = new SQL.Database(fileBuffer);
    } else if (!isVercel && fs.existsSync(fullPath)) {
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
    if (isVercel) {
        // Em Vercel, salvar em /tmp (ephemeral)
        try {
            const data = dbInstance.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(writablePath, buffer);
        } catch (e) {
            // Ignorar erros de escrita em serverless
        }
    } else {
        const data = dbInstance.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(fullPath, buffer);
    }
}

function getDb() {
    return dbInstance;
}

module.exports = { initDb, getDb, saveDb };
