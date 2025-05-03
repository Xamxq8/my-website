const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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

// صفحة تسجيل الدخول
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // عرض صفحة تسجيل الدخول أولاً
});

// التحقق من بيانات تسجيل الدخول
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = {
    "1111": "1111",
    "2222": "2222",
    "3333": "3333",
    "4444": "5555"
  };

  if (users[username] === password) {
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
