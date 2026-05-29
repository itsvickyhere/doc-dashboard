const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sseClients = new Set();
app.locals.sseClients = sseClients;
app.locals.broadcast = (data) => {
sseClients.forEach(res => res.write(`data: ${JSON.stringify(data)}\n\n`));
};

app.get('/api/events', (req, res) => {
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.flushHeaders();
sseClients.add(res);
const hb = setInterval(() => res.write(': heartbeat\n\n'), 25000);
req.on('close', () => { clearInterval(hb); sseClients.delete(res); });
});

app.use('/api', require('./routes/documents'));
app.use('/api', require('./routes/notifications'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
