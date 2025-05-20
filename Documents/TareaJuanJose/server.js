// 1. Importar módulos necesarios
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');

// 2. Inicializar Express y configurar el puerto
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Configurar EJS como motor de plantillas y carpeta de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 5. Configurar sesiones
app.use(session({
  secret: 'mi_secreto_super_seguro',
  resave: false,
  saveUninitialized: false
}));

// 6. Conexión a base de datos
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err);
  } else {
    console.log("Conectado a la base de datos SQLite.");
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS pagos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        monto REAL,
        metodo TEXT,
        descripcion TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);
  }
});

// 7. Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { nombre, correo, password } = req.body;
  if (!nombre || !correo || !password || password.length < 6) {
    return res.status(400).json({ success: false, error: "Datos inválidos o contraseña muy corta." });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ success: false, error: "Error al encriptar contraseña." });

    const query = `INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)`;
    db.run(query, [nombre, correo, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ success: false, error: "Correo ya registrado." });
        }
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: "Usuario registrado correctamente", userId: this.lastID });
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ success: false, error: "Campos incompletos." });

  db.get(`SELECT * FROM usuarios WHERE correo = ?`, [correo], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(400).json({ success: false, error: "Usuario no encontrado." });

    bcrypt.compare(password, row.password, (err, coinciden) => {
      if (err) return res.status(500).json({ success: false, error: "Error al comparar." });
      if (!coinciden) return res.status(400).json({ success: false, error: "Contraseña incorrecta." });

      req.session.user = { id: row.id, nombre: row.nombre, correo: row.correo };
      res.json({ success: true, message: "Login exitoso" });
    });
  });
});

app.get('/menu', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('menu', {
    nombre: req.session.user.nombre,
    correo: req.session.user.correo
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Página de configuración de cuenta (GET)
app.get('/configuracion-cuenta', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('configuracion-cuenta', {
    nombre: req.session.user.nombre,
    correo: req.session.user.correo
  });
});

// Actualizar cuenta (POST => PUT simulado)
app.post('/actualizar-cuenta', (req, res) => {
  const usuarioId = req.session.user.id;
  const { nombre, correo } = req.body;

  db.run(`UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?`,
    [nombre, correo, usuarioId],
    function (err) {
      if (err) return res.status(500).send("Error al actualizar datos.");

      // Actualizar sesión
      req.session.user.nombre = nombre;
      req.session.user.correo = correo;
      res.redirect('/menu');
    }
  );
});

// Eliminar cuenta (POST => DELETE simulado)
app.post('/eliminar-cuenta', (req, res) => {
  const usuarioId = req.session.user.id;

  db.run(`DELETE FROM usuarios WHERE id = ?`, [usuarioId], function (err) {
    if (err) return res.status(500).send("Error al eliminar cuenta.");

    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

// 8. Funciones de pago
app.get('/realizar-pago', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('realizar-pago', {
    nombre: req.session.user.nombre,
    correo: req.session.user.correo
  });
});

// Ruta para procesar el formulario de realizar pago (POST /realizar-pago)
app.post('/realizar-pago', (req, res) => {
  const { monto, metodo, descripcion } = req.body;
  const usuarioId = req.session.user?.id;

  // Validación
  if (!usuarioId) {
    return res.redirect('/login');
  }
  if (!monto || !metodo || !descripcion) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  // Insertar en la base de datos
  const insertPago = `INSERT INTO pagos (usuario_id, monto, metodo, descripcion)
                      VALUES (?, ?, ?, ?)`;
  db.run(insertPago, [usuarioId, monto, metodo, descripcion], function(err) {
    if (err) {
      return res.status(500).send('Error al registrar el pago.');
    }

    // Redirigir al historial de transacciones
    res.redirect('/historial-transacciones');
  });
});

app.get('/mensajes-promociones', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('mensajes-promociones');
});

app.get('/ayuda', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('ayuda');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get('/historial-transacciones', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const usuarioId = req.session.user.id;

  db.all(`SELECT * FROM pagos WHERE usuario_id = ? ORDER BY fecha DESC`, [usuarioId], (err, pagos) => {
    if (err) {
      return res.status(500).send("Error al obtener los pagos");
    }

    res.render('historial-transacciones', {
      nombre: req.session.user.nombre,
      pagos
    });
  });
});
