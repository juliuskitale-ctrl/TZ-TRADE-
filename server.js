require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const checkoutRouter = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'TZ Trade Hub';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: APP_NAME });
});

app.use('/api/checkout', checkoutRouter);

// Fallback to index.html for the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`${APP_NAME} server listening on port ${PORT}`);

  // Fail loudly (but don't crash health-check-only deployments) if
  // ClickPesa credentials look unset, so misconfiguration is obvious
  // in the logs right away instead of surfacing as a mystery 500 later.
  if (!process.env.CLICKPESA_CLIENT_ID || !process.env.CLICKPESA_API_KEY) {
    console.warn(
      '[WARNING] CLICKPESA_CLIENT_ID / CLICKPESA_API_KEY are not set. ' +
      'Mobile money checkout will fail until these are configured as ' +
      'environment variables (set them in Render\'s dashboard for production).'
    );
  }
});
