require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.APP_KEY || 'my-super-secret-key-123',
  resave: false,
  saveUninitialized: false,
}));

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/', isAuthenticated, async (req, res) => {
  try {
    const [notes] = await db.query('SELECT * FROM notes WHERE userId = ? ORDER BY createdAt DESC', [req.session.userId]);
    res.render('index', { username: req.session.username, notes: notes || [] });
  } catch (err) {
    res.status(500).send('Database error');
  }
});

app.post('/notes', isAuthenticated, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.redirect('/');
  
  try {
    await db.query('INSERT INTO notes (userId, content) VALUES (?, ?)', [req.session.userId, content]);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Database error');
  }
});

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];
    
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (err) {
    res.render('login', { error: 'An error occurred' });
  }
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.render('register', { error: 'Username and password are required' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    
    req.session.userId = result.insertId;
    req.session.username = username;
    res.redirect('/');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.render('register', { error: 'Username already exists' });
    }
    res.render('register', { error: 'An error occurred' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
