const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log("DB_HOST from .env =", process.env.DB_HOST);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

connection.connect((err) => {
  if (err) return console.error('Connection error:', err);
  console.log('Connected to PlanetScale');
});

// إنشاء 4 مستخدمين تلقائيًا بكلمة مرور 1111
const users = [
  { username: 'user1', password: '1111' },
  { username: 'user2', password: '1111' },
  { username: 'user3', password: '1111' },
  { username: 'user4', password: '1111' }
];

// إضافة المستخدمين إذا لم يكونوا موجودين في قاعدة البيانات
users.forEach(user => {
  connection.query('SELECT * FROM users WHERE username = ?', [user.username], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [user.username, user.password], (err) => {
        if (err) throw err;
        console.log(`User ${user.username} added successfully`);
      });
    }
  });
});

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API: إضافة زوج
app.post('/add-couple', (req, res) => {
  const { coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate } = req.body;
  const treatmentEnd = new Date(treatmentStart);
  treatmentEnd.setDate(treatmentEnd.getDate() + parseInt(treatmentDays));

  const query = `INSERT INTO couples 
    (couple_id, egg_count, treatment, treatment_start, treatment_end, treatment_days, hatch_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [coupleId, eggCount, treatment, treatmentStart, treatmentEnd, treatmentDays, hatchDate], (err) => {
    if (err) return res.status(500).send('Error saving couple');
    res.status(200).send('Couple saved');
  });
});

// API: جلب الأزواج
app.get('/get-couples', (req, res) => {
  connection.query('SELECT * FROM couples', (err, results) => {
    if (err) return res.status(500).send('Error loading couples');
    res.json(results);
  });
});

// API: حذف زوج
app.delete('/delete-couple/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM couples WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Error deleting couple');
    res.send('Couple deleted');
  });
});

// API: تعديل زوج
app.put('/update-couple/:id', (req, res) => {
  const { coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate } = req.body;
  const { id } = req.params;
  const treatmentEnd = new Date(treatmentStart);
  treatmentEnd.setDate(treatmentEnd.getDate() + parseInt(treatmentDays));

  const query = `UPDATE couples SET 
    couple_id = ?, egg_count = ?, treatment = ?, 
    treatment_start = ?, treatment_end = ?, treatment_days = ?, hatch_date = ?
    WHERE id = ?`;

  connection.query(query, [coupleId, eggCount, treatment, treatmentStart, treatmentEnd, treatmentDays, hatchDate, id], (err) => {
    if (err) return res.status(500).send('Error updating couple');
    res.send('Couple updated');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
