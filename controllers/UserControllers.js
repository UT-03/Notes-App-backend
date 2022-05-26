const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../util/HttpError');
const User = require('../models/user');

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 406));
    }

    const { username, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ username: username });
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exists already, please login instead.', 406);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again later.', 500);
        return next(error);
    }

    const newUser = new User({
        username,
        passowrd: hashedPassword
    });

    try {
        await newUser.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again later.', 500);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { username: newUser.id },
            `${process.env.SECRET_TOKEN}`,
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again later.', 500);
        return next(error);
    }

    res
        .status(201)
        .json({
            token: token
        })
}

const login = async (req, res, next) => {
    const { username, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ username: username });
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again later.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials, could not log you in.', 404);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Something went wrong, please try again later.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not log you in.', 406);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            `${process.env.SECRET_TOKEN}`,
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('Something wnet wrong, please try again later.', 500);
        return next(error);
    }

    res
        .status(200)
        .json({
            token: token
        })
}

module.exports = {
    signup,
    login
}