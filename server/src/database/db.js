const { getDb, saveDb } = require('./connection');

// Wrapper que se comporta similar ao better-sqlite3
function query(sql, ...params) {
    const db = getDb();
    const results = [];
    const stmt = db.prepare(sql);
    if (params.length > 0) {
        stmt.bind(params);
    }
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function queryOne(sql, ...params) {
    const db = getDb();
    const stmt = db.prepare(sql);
    if (params.length > 0) {
        stmt.bind(params);
    }
    let row = null;
    if (stmt.step()) {
        row = stmt.getAsObject();
    }
    stmt.free();
    return row;
}

function run(sql, ...params) {
    const db = getDb();
    db.run(sql, params);
    // Get last insert rowid BEFORE saveDb (saveDb resets it)
    let lastInsertRowid = 0;
    try {
        const stmt = db.prepare('SELECT last_insert_rowid()');
        if (stmt.step()) {
            const row = stmt.getAsObject();
            lastInsertRowid = row['last_insert_rowid()'] || 0;
        }
        stmt.free();
    } catch (e) {
        // ignore
    }
    saveDb();
    return { lastInsertRowid };
}

function exec(sql) {
    const db = getDb();
    db.run(sql);
    saveDb();
}

module.exports = { query, queryOne, run, exec };
