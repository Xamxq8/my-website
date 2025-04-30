const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const client = new Client({
  connectionString: 'postgresql://farm_zajel_43uh_user:rOgWumVlUJsBEpiFpmnLrokD79pt33gv@dpg-d07cv1ruibrs73fcejsg-a.ohio-postgres.render.com/farm_zajel_43uh',
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err.stack));

// مسار لإضافة الأزواج
app.post('/add-couple', (req, res) => {
  const { coupleId, eggCount } = req.body;

  const query = 'INSERT INTO couples (couple_id, egg_count) VALUES ($1, $2)';
  client.query(query, [coupleId, eggCount], (err, result) => {
    if (err) {
      return res.status(500).send('Error adding couple');
    }
    res.status(200).send('Couple added successfully');
  });
});

// مسار لعرض الأزواج
app.get('/get-couples', (req, res) => {
  const query = 'SELECT * FROM couples';
  client.query(query, (err, result) => {
    if (err) {
      return res.status(500).send('Error fetching couples');
    }
    res.status(200).json(result.rows);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
