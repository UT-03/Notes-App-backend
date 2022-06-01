const express = require('express');
const { check } = require('express-validator');

const notesControllers = require('../controllers/NotesControllers');
const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

router.use(checkAuth);

router.get('/', notesControllers.getNotes);

router.post('/add-new-note', [
    check('heading')
        .not()
        .isEmpty(),
    check('tags')
        .not()
        .isEmpty(),
    check('body')
        .isLength({ min: 10 })
], notesControllers.createNewNote);

router.patch('/edit-note', [
    check('heading')
        .not()
        .isEmpty(),
    check('tags')
        .not()
        .isEmpty(),
    check('body')
        .isLength({ min: 10 })
], notesControllers.editNote);

router.delete('/', notesControllers.deleteNote);

module.exports = router;