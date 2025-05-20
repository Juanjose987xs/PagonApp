const DatabaseManager = require("./DatabaseManager");
const moment = require("moment");

class Usuario {
    constructor(id, nombre, saldo) {
        this.id = id;
        this.nombre = nombre;
        this.saldo = saldo;
    }

    static autenticar(id, password, callback) {
        const db = DatabaseManager.getConnection();

        db.get(
            `SELECT * FROM usuarios WHERE id = ? AND password = ?`,
            [id, password],
            (err, row) => {
                if (err) {
                    console.error("Error al autenticar usuario:", err.message);
                    callback(null);
                } else if (row) {
                    callback(new Usuario(row.id, row.nombre, row.saldo));
                } else {
                    console.log("Credenciales incorrectas.");
                    callback(null);
                }
            }
        );

        db.close();
    }

    recargarSaldo(monto, callback) {
        if (monto <= 0) {
            console.log("El monto debe ser positivo.");
            callback(false);
            return;
        }

        const db = DatabaseManager.getConnection();

        db.run(
            `UPDATE usuarios SET saldo = saldo + ? WHERE id = ?`,
            [monto, this.id],
            (err) => {
                if (err) {
                    console.error("Error al recargar saldo:", err.message);
                    callback(false);
                } else {
                    this.saldo += monto;
                    this.registrarTransaccion("Recarga", monto);
                    console.log(`Recarga exitosa. Saldo actual: $${this.saldo}`);
                    callback(true);
                }
            }
        );

        db.close();
    }

    pagarTransporte(tarifa, callback) {
        if (this.saldo < tarifa) {
            console.log("Saldo insuficiente.");
            callback(false);
            return;
        }

        const db = DatabaseManager.getConnection();

        db.run(
            `UPDATE usuarios SET saldo = saldo - ? WHERE id = ?`,
            [tarifa, this.id],
            (err) => {
                if (err) {
                    console.error("Error al realizar el pago:", err.message);
                    callback(false);
                } else {
                    this.saldo -= tarifa;
                    this.registrarTransaccion("Pago", tarifa);
                    console.log(`Pago exitoso. Saldo restante: $${this.saldo}`);
                    callback(true);
                }
            }
        );

        db.close();
    }

    registrarTransaccion(tipo, monto) {
        const db = DatabaseManager.getConnection();

        db.run(
            `INSERT INTO transacciones (usuario_id, tipo, monto, fecha) VALUES (?, ?, ?, ?)`,
            [this.id, tipo, monto, moment().format()],
            (err) => {
                if (err) {
                    console.error("Error al registrar transacción:", err.message);
                }
            }
        );

        db.close();
    }
}

module.exports = Usuario;
