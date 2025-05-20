const sqlite3 = require("sqlite3").verbose();

const DATABASE_URL = "transporte_publico.db";

class DatabaseManager {
    static initDatabase() {
        const db = new sqlite3.Database(DATABASE_URL);

        db.serialize(() => {
            // Tabla de usuarios
            db.run(`
                CREATE TABLE IF NOT EXISTS usuarios (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  nombre TEXT NOT NULL,
                  correo TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL
                )
            `);              

            // Tabla de transacciones
            db.run(`
                CREATE TABLE IF NOT EXISTS transacciones (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  usuario_id INTEGER NOT NULL,
                  tipo TEXT NOT NULL,
                  monto REAL NOT NULL,
                  fecha TEXT NOT NULL,
                  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
                )
            `);              

            console.log("Base de datos inicializada.");
        });

        db.close();
    }

    static getConnection() {
        return new sqlite3.Database(DATABASE_URL);
    }
}

module.exports = DatabaseManager;
