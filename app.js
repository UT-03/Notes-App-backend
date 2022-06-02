require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/UserRoutes');
const notesRoutes = require('./routes/NotesRoutes');
const HttpError = require('./util/HttpError');

const PORT = 5000;

const app = express();

app.use(bodyParser.json());

// CORS handler
app.use(cors({
    origin: `${process.env.FRONTEND_SERVER_URL}`
}))

// Routes here
app.use('/api/user', userRoutes);
app.use('/api/notes', notesRoutes);

// Default route => If no route matches
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route!', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
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