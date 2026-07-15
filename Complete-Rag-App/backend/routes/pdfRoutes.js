const express = require('express');
const router = express.Router();
const { uploadPdf, listPdfs, viewPdf, deletePdf, searchPdfs } = require('../controllers/pdfController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Both admin and user (any authenticated user) can list & view PDFs
router.get('/', authenticateToken, listPdfs);
router.get('/view/:id', authenticateToken, viewPdf);

// RAG semantic search — available to any authenticated user
router.post('/search', authenticateToken, searchPdfs);

// Only admin can upload & delete PDFs
router.post('/upload', authenticateToken, authorizeAdmin, upload.single('pdf'), uploadPdf);
router.delete('/:id', authenticateToken, authorizeAdmin, deletePdf);

module.exports = router;
