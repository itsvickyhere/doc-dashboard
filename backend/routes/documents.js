const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, uuidv4 } = require('../db/database');

const storage = multer.diskStorage({
destination: (req, file, cb) => {
const dir = path.join(__dirname, '../uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
cb(null, dir);
},
filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});

const upload = multer({
storage,
fileFilter: (req, file, cb) => {
file.mimetype === 'application/pdf'
? cb(null, true)
: cb(new Error('Only PDF files allowed'), false);
},
limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/upload', upload.array('files', 20), (req, res) => {
const files = req.files;
if (!files || files.length === 0)
return res.status(400).json({ error: 'No files uploaded' });

const isBulk = files.length > 3;
const sessionId = uuidv4();

if (isBulk) {
db.prepare(`INSERT INTO upload_sessions (id, total_files, status) VALUES (?, ?, 'processing')`)
.run(sessionId, files.length);
}

const insertDoc = db.prepare(
`INSERT INTO documents (id, filename, original_name, size, mime_type, path) VALUES (?, ?, ?, ?, ?, ?)`
);
const insertNotif = db.prepare(
`INSERT INTO notifications (id, message, type) VALUES (?, ?, ?)`
);

const docs = files.map(f => {
const id = uuidv4();
insertDoc.run(id, f.filename, f.originalname, f.size, f.mimetype, f.path);
return { id, filename: f.filename, original_name: f.originalname, size: f.size };
});

if (isBulk) {
db.prepare(`UPDATE upload_sessions SET processed=?, status='complete' WHERE id=?`)
.run(files.length, sessionId);
const notifId = uuidv4();
const msg = `${files.length} files uploaded successfully`;
insertNotif.run(notifId, msg, 'success');
req.app.locals.broadcast({ type: 'bulk_complete', count: files.length, message: msg, timestamp: new Date().toISOString(), notifId });
} else {
files.forEach(f => {
insertNotif.run(uuidv4(), `File "${f.originalname}" uploaded successfully`, 'success');
});
}

res.json({ success: true, isBulk, count: files.length, documents: docs });
});

router.get('/documents', (req, res) => {
const docs = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
res.json(docs);
});

router.get('/documents/:id/download', (req, res) => {
const doc = db.prepare('SELECT * FROM documents WHERE id=?').get(req.params.id);
if (!doc) return res.status(404).json({ error: 'Not found' });
res.download(doc.path, doc.original_name);
});

module.exports = router;
