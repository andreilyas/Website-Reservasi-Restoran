const express = require('express');
const { login, register } = require('../controllers/authController');
const { validateLogin, validateRegistration } = require('../middleware/validation');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegistration, register);

module.exports = router;
