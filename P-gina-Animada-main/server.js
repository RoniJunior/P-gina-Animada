require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  try {
    const client = await pool.connect();
    try {
      const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exists.rows.length) return res.status(400).json({ error: 'E-mail já cadastrado.' });

      const password_hash = await bcrypt.hash(password, 10);
      const insert = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [name || null, email, password_hash]
      );
      return res.status(201).json({ message: 'Cadastro realizado com sucesso.', id: insert.rows[0].id });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  try {
    const client = await pool.connect();
    try {
      const q = await client.query('SELECT id, name, password_hash FROM users WHERE email = $1', [email]);
      if (!q.rows.length) return res.status(401).json({ error: 'Credenciais inválidas.' });

      const user = q.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

      const token = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ message: 'Login bem-sucedido.', token, user: { id: user.id, name: user.name } });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Token não fornecido.' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Formato de token inválido.' });
  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Token inválido.' });
    req.user = payload;
    next();
  });
}

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const q = await client.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.userId]);
      if (!q.rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
      return res.json({ user: q.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  try {
    const client = await pool.connect();
    try {
      const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exists.rows.length) return res.status(400).json({ error: 'E-mail já cadastrado.' });

      const password_hash = await bcrypt.hash(password, 10);
      const insert = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [name || null, email, password_hash]
      );
      return res.status(201).json({ message: 'Cadastro realizado com sucesso.', id: insert.rows[0].id });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  try {
    const client = await pool.connect();
    try {
      const q = await client.query('SELECT id, name, password_hash FROM users WHERE email = $1', [email]);
      if (!q.rows.length) return res.status(401).json({ error: 'Credenciais inválidas.' });

      const user = q.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

      // No exemplo simples, não criamos um JWT; apenas retornamos sucesso.
      return res.json({ message: 'Login bem-sucedido.', user: { id: user.id, name: user.name } });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    try {
        const client = await pool.connect();
        try {
            const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            if (exists.rowCount > 0) {
                return res.status(409).json({ error: 'Usuário já cadastrado.' });
            }
            const hash = await bcrypt.hash(password, 10);
            const insert = await client.query(
                'INSERT INTO users(name, email, password_hash) VALUES($1,$2,$3) RETURNING id',
                [name || null, email, hash]
            );
            return res.json({ message: 'Cadastro realizado com sucesso.', id: insert.rows[0].id });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
            if (result.rowCount === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(401).json({ error: 'Credenciais inválidas.' });
            return res.json({ message: 'Login bem-sucedido.', id: user.id });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
