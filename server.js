import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SESSION_SECRET } = process.env;

// pool اتصال بقاعدة PlanetScale
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: true }
});

// جلسات
app.use(session({
  secret: SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*3600*1000 }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة الجداول والـ seed للمستخدمين الأربعة
(async()=>{
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
  for(let u of users){
    const hash = await bcrypt.hash('1111', 10);
    await conn.query(
      'INSERT IGNORE INTO users(username,password) VALUES(?,?)',
      [u, hash]
    );
  }
  conn.release();
})();

// واجهة الدخول
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'login.html')));

// التحقق من تسجيل الدخول
app.post('/login', async (req,res)=>{
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username=?',[username]);
  if(!rows.length) return res.status(401).send('بيانات غير صحيحة');
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if(ok){
    req.session.loggedIn = true;
    return res.sendStatus(200);
  }
  res.status(401).send('بيانات غير صحيحة');
});

// لوحة التحكم
app.get('/dashboard', (req,res)=>{
  if(!req.session.loggedIn) return res.redirect('/');
  res.sendFile(path.join(__dirname,'index.html'));
});

// تسجيل الخروج
app.get('/logout', (req,res)=>{
  req.session.destroy();
  res.redirect('/');
});

// إضافة زوج
app.post('/add-couple', async (req,res)=>{
  const { coupleId, eggCount, treatmentDays } = req.body;
  const now = new Date().toISOString().split('T')[0];
  let status = 'no_eggs';
  if(eggCount>0) status = 'eggs';
  else if(treatmentDays>0) status = 'treatment';
  await pool.query(
    `INSERT INTO couples
     (couple_id,egg_count,treatment_days,treatment_start,insert_date,status)
     VALUES(?,?,?,?,?,?)`,
    [coupleId, eggCount, treatmentDays, treatmentDays? now : null, now, status]
  );
  res.json({ success:true });
});

// حذف زوج
app.delete('/delete-couple/:id', async (req,res)=>{
  await pool.query('DELETE FROM couples WHERE id=?',[req.params.id]);
  res.json({ success:true });
});

// جلب الأزواج وتحديث وضع الفقس
app.get('/get-couples', async (req,res)=>{
  // ترحيل الحالات إلى chicks
  await pool.query(`
    INSERT INTO chicks
      (couple_id,hatch_date,days_since_hatch,days_until_slaughter)
    SELECT couple_id,CURDATE(),
           DATEDIFF(CURDATE(), insert_date),
           GREATEST(18-DATEDIFF(CURDATE(), insert_date),0)
    FROM couples
    WHERE status='eggs' AND DATEDIFF(CURDATE(), insert_date)>=18
    ON DUPLICATE KEY UPDATE couple_id=couple_id;
  `);
  await pool.query(
    `UPDATE couples SET status='chicks'
     WHERE status='eggs' AND DATEDIFF(CURDATE(), insert_date)>=18`
  );
  const [rows] = await pool.query('SELECT * FROM couples');
  res.json(rows);
});

// جلب الفراخ
app.get('/get-chicks', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM chicks');
  res.json(rows);
});

app.listen(PORT,()=> console.log(`Server on ${PORT}`));
