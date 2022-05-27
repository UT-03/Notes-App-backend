require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/UserRoutes');
const notesRoutes = require('./routes/NotesRoutes');
const HttpError = require('./util/HttpError');

const PORT = 5000;

const app = express();

app.use(bodyParser.json());

// CORS handler
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    next();
});

// Routes here
app.use('/api/user', userRoutes);
app.use('/api/notes', notesRoutes);

// Default route => If no route matches
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route!', 404);
    throw error;
});

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.3ogsy.mongodb.net/?retryWrites=true&w=majority`
    )
    .then(() => {
        console.log("Connected to database!")
        app.listen(PORT);
    })
    .then(() => {
        console.log(`Server started at http://localhost:${PORT}`);
    })
    .catch(err => {
        console.log(err);
    });