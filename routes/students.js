const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Student = require("../schemas/Student");

// get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    console.error(err);
  }
});

// get single student by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  try {
    const student = await Student.findById(id);
    if (!student) {
      const status = 404;
      return res.status(status).json({ msg: "Item not found", status });
    }

    res.status(200).json(student);
  } catch (err) {
    console.error(err);
  }
});

// create student
router.post("/", async (req, res) => {
  const { name } = req.body;
  const newStudent = new Student({ name });
  try {
    const student = await newStudent.save();
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
  }
});

// update student
router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ msg: "No data set" });
  }
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  const studentFields = {
    name,
  };

  let student;
  try {
    student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: studentFields },
      { new: true, useFindAndModify: false }
    );
    if (!student) {
      const status = 404;
      return res.status(status).json({ msg: "Item not found", status });
    }
    res.status(200).json(student);
  } catch (err) {
    console.error(err);
  }
});

// delete student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  try {
    let status = 200;
    const found = await Student.findByIdAndDelete(id);
    if (!found) {
      status = 404;
      return res.status(status).json({ msg: "Item not found", status });
    }
    res.status(status).json({ msg: `Item ${id} deleted`, status });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
