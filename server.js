import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// __dirname compatibility for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SESSION_SECRET } = process.env;

// PlanetScale (MySQL) pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: true }
});

// session middleware
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 3600 * 1000 }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// initialize tables & seed users
(async () => {
  const conn = await pool.getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE,
      password VARCHAR(255)
    );
    CREATE TABLE IF NOT EXISTS couples (
      id INT AUTO_INCREMENT PRIMARY KEY,
      couple_id VARCHAR(20),
      egg_count INT DEFAULT 0,
      treatment_days INT DEFAULT 0,
      treatment_start DATE,
      insert_date DATE DEFAULT CURRENT_DATE,
      status ENUM('no_eggs','eggs','treatment','chicks') DEFAULT 'no_eggs'
    );
    CREATE TABLE IF NOT EXISTS chicks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      couple_id VARCHAR(20),
      hatch_date DATE,
      days_since_hatch INT,
      days_until_slaughter INT
    );
  `);
  const users = ['user1','user2','user3','user4'];
  for (const u of users) {
    const hash = await bcrypt.hash('1111', 10);
    await conn.query(
      'INSERT IGNORE INTO users(username, password) VALUES(?, ?)',
      [u, hash]
    );
  }
  conn.release();
})();

// routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).send('بيانات غير صحيحة');
  const ok = await bcrypt.compare(password, rows[0].password);
  if (ok) {
    req.session.loggedIn = true;
    return res.sendStatus(200);
  }
  res.status(401).send('بيانات غير صحيحة');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.post('/add-couple', async (req, res) => {
  const { coupleId, eggCount, treatmentDays } = req.body;
  const now = new Date().toISOString().split('T')[0];
  let status = 'no_eggs';
  if (eggCount > 0) status = 'eggs';
  else if (treatmentDays > 0) status = 'treatment';
  await pool.query(
    `INSERT INTO couples
       (couple_id, egg_count, treatment_days, treatment_start, insert_date, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [coupleId, eggCount, treatmentDays, treatmentDays ? now : null, now, status]
  );
  res.json({ success: true });
});

app.delete('/delete-couple/:id', async (req, res) => {
  await pool.query('DELETE FROM couples WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.get('/get-couples', async (req, res) => {
  // move hatched pairs to chicks
  await pool.query(`
    INSERT INTO chicks (couple_id, hatch_date, days_since_hatch, days_until_slaughter)
    SELECT couple_id, CURDATE(),
           DATEDIFF(CURDATE(), insert_date),
           GREATEST(18 - DATEDIFF(CURDATE(), insert_date), 0)
    FROM couples
    WHERE status = 'eggs' AND DATEDIFF(CURDATE(), insert_date) >= 18
    ON DUPLICATE KEY UPDATE couple_id = couple_id;
  `);
  await pool.query(`
    UPDATE couples
    SET status = 'chicks'
    WHERE status = 'eggs' AND DATEDIFF(CURDATE(), insert_date) >= 18;
  `);
  const [rows] = await pool.query('SELECT * FROM couples');
  res.json(rows);
});

app.get('/get-chicks', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM chicks');
  res.json(rows);
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
