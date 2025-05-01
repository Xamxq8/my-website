const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log("DB_HOST from .env =", process.env.DB_HOST);

// ربط قاعدة البيانات
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

// إضافة المستخدمين الأربعة تلقائيًا
const users = [
  { username: 'user1', password: '1111' },
  { username: 'user2', password: '1111' },
  { username: 'user3', password: '1111' },
  { username: 'user4', password: '1111' }
];

users.forEach((user) => {
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  connection.query(query, [user.username, user.password], (err) => {
    if (err) console.error(`Error adding user ${user.username}:`, err);
  });
});

app.use(bodyParser.json());
app.use(express.static(__dirname));

// عرض الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API: إضافة زوج
app.post('/add-couple', (req, res) => {
  const { coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate } = req.body;
  const query = `INSERT INTO couples 
    (couple_id, egg_count, treatment, treatment_start, treatment_days, hatch_date)
    VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(query, [coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate], (err) => {
    if (err) return res.status(500).send('Error saving couple');
    res.status(200).send('Couple saved');
  });
});

// API: جلب الأزواج
app.get('/get-couples', (req, res) => {
  const query = 'SELECT * FROM couples';
  connection.query(query, (err, results) => {
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
  const query = `UPDATE couples SET 
    couple_id = ?, egg_count = ?, treatment = ?, 
    treatment_start = ?, treatment_days = ?, hatch_date = ?
    WHERE id = ?`;
  connection.query(query, [coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate, id], (err) => {
    if (err) return res.status(500).send('Error updating couple');
    res.send('Couple updated');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
