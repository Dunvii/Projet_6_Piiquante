const express = require('express');
const router = express.Router();

const stuffCtrl = require('../controllers/stuff');

router.post('/api/auth/signup', stuffCtrl.getAllStuff);
router.post('/api/auth/login', stuffCtrl.getAllStuff);
router.get('/api/sauces', stuffCtrl.getAllStuff);
router.get('/api/sauces/:id', stuffCtrl.getAllStuff);
router.post('/api/sauces', stuffCtrl.getAllStuff);
router.put('/api/sauces/:id', stuffCtrl.getAllStuff);
router.delete('/api/sauces/:id', stuffCtrl.getAllStuff);
router.post('/api/sauces/:id/like', stuffCtrl.getAllStuff);

module.exports = router;