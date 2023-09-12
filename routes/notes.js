const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// consists of all the endpoints realated to notes.

//Route - 1 : get all the notes using : GET "api/notes/fetchallnotes" : Login in requires
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});

//Route - 2 : Adding a new note : POST "api/notes/addnote" : Login in requires
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a Valid title").isLength({ min: 5 }),
    body("description", "Enter a Valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //displaying errors pertaing to the validation.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;

    // adding a new note
    const notes = new Notes({
      title,
      description,
      tag,
      user: req.user.id,
    });
    const savedNote = await notes.save();
    res.json(savedNote);
  }
);

//Route - 3 : Adding a new note : PUT "api/notes/updatenote/:id" : Login in requires
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route - 4 : deletion of existing note : DELETE "api/notes/deletenote/:id" : Login in requires
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // Find the note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
