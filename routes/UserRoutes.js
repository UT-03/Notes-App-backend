const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/UserControllers');

const router = express.Router();

router.post('/signup',
    [check('username').not().isEmpty(), check('password').isLength({ min: 6 })],
    usersControllers.signup);

router.post('/login', usersController.login);

module.exports = router;