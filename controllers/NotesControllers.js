const { validationResult } = require('express-validator');

const User = require('../models/user');
const Note = require('../models/note');
const HttpError = require('../util/HttpError');
const mongoose = require('mongoose');

const getNotes = async (req, res, next) => {
    const userId = req.userData.userId;

    let userWithNotes;
    try {
        userWithNotes = await User.findById(userId).populate('notes');
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, Please try again later.', 500);
        return next(error);
    }

    if (!userWithNotes) {
        const error = new HttpError('Something went wrong, Please try again later.', 404);
        return next(error);
    }

    res.json({
        notes: userWithNotes.notes.map(note => note.toObject({ getters: true }))
    })
}

const createNewNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs, Please try again later!', 406));
    }

    const { heading, tags, body } = req.body;

    const tagsArray = tags.split(',').map(tag => tag.trim());

    const newNote = new Note({
        heading,
        tags: tagsArray,
        body,
        creator: req.userData.userId
    });

    let existingUser;
    try {
        existingUser = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError('Something went wrong, Please try again later.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Something went wrong, Please try again later.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newNote.save({ session: sess });
        existingUser.notes.push(newNote);
        await existingUser.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, Please try again later.', 500);
        return next(error);
    }

    res.status(201).json({ message: "Note added" });
}

const editNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs, Please try again later!', 406));
    }

    const { heading, tags, body } = req.body;
    const noteId = req.params.noteId;


    let note;
    try {
        note = await Note.findById(noteId);
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, Please try again later.', 500);
        return next(error);
    }

    if (note.creator.toString() !== req.userData.userId) {
        const error = new HttpError('Something went wrong, Please try again later', 401);
        return next(error);
    }

    const tagsArray = tags.split(',').map(tag => tag.trim());
    note.heading = heading;
    note.tags = tagsArray;
    note.body = body;

    try {
        await note.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, Please try again later', 500);
        return next(error);
    }

    res.json({
        note: note.toObject({ getters: true })
    });
}

const deleteNote = async (req, res, next) => {
    const noteId = req.params.noteId;

    let noteToBeDeleted;
    try {
        noteToBeDeleted = await Note.findById(noteId).populate('creator');
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, Please try again later.', 500);
        return next(error);
    }

    if (!noteToBeDeleted) {
        const error = new HttpError('Something went wrong, Please try later.', 404);
        return next(error);
    }

    if (noteToBeDeleted.creator.id !== req.userData.userId) {
        const error = new HttpError('Something went wrong, Please try again later.', 401);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await noteToBeDeleted.remove({ session: sess });

        noteToBeDeleted.creator.notes.pull(noteToBeDeleted);
        await noteToBeDeleted.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Something went wrong, Please try again later.', 500);
        return next(error);
    }

    res.json({ message: "Note deleted!" });
}

module.exports = {
    getNotes,
    createNewNote,
    editNote,
    deleteNote
}