const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../db/database');

router.get('/notifications', (req, res) => {
const notifs = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
res.json(notifs);
});

router.patch('/notifications/:id/read', (req, res) => {
db.prepare('UPDATE notifications SET read=1 WHERE id=?').run(req.params.id);
res.json({ success: true });
});

router.patch('/notifications/read-all', (req, res) => {
db.prepare('UPDATE notifications SET read=1').run();
res.json({ success: true });
});

module.exports = router;