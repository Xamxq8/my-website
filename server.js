const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.log("DB_HOST from .env =", process.env.DB_HOST);

// إنشاء الاتصال بقاعدة البيانات
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

app.use(bodyParser.json());
app.use(express.static(__dirname));

// الجلب من المسار الرئيسي
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

// API: تحديث الأزواج
app.put('/update-couple/:id', (req, res) => {
  const { id } = req.params;
  const { coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate } = req.body;
  const query = `UPDATE couples SET 
    couple_id = ?, egg_count = ?, treatment = ?, treatment_start = ?, treatment_days = ?, hatch_date = ? 
    WHERE id = ?`;
  connection.query(query, [coupleId, eggCount, treatment, treatmentStart, treatmentDays, hatchDate, id], (err) => {
    if (err) return res.status(500).send('Error updating couple');
    res.status(200).send('Couple updated');
  });
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
