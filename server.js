require('dotenv').config();
console.log("DB_HOST from .env =", process.env.DB_HOST); // ← هذا السطر للاختبار

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});

connection.connect(err => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  console.log('Connected to PlanetScale');
});

app.post('/add-couple', (req, res) => {
  const { coupleId, eggCount } = req.body;
  const query = 'INSERT INTO couples (couple_id, egg_count) VALUES (?, ?)';
  connection.query(query, [coupleId, eggCount], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error adding couple');
    }
    res.send('Couple added');
  });
});

app.get('/get-couples', (req, res) => {
  const query = 'SELECT * FROM couples';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching couples');
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
