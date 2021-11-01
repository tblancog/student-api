const express = require("express");
const router = express.Router();
const Course = require("../schemas/Course");
const Student = require("../schemas/Student");

// get all courses
router.get("/", async (req, res) => {
  let student;
  if (req.query.student) {
    student = await Student.findOne({ name: req.query.student });
  }
  try {
    const courses = await Course.find({
      ...(student && { students: student }),
    });
    res.status(200).json(
      courses?.map(({ _id, title, students }) => ({
        id: _id,
        title,
        students,
      }))
    );
  } catch (err) {
    console.error(err);
  }
});

// get single Course by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  try {
    const course = await Course.findById(id);
    if (!course) {
      const status = 404;
      return res.status(status).json({ msg: "Item not found", status });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error(err);
  }
});

// create Course
router.post("/", async (req, res) => {
  const { title } = req.body;
  const newCourse = new Course({ title });
  try {
    const Course = await newCourse.save();
    res.status(201).json(Course);
  } catch (err) {
    console.error(err);
  }
});

// update Course
router.put("/:id", async (req, res) => {
  const { title } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ msg: "No data set" });
  }
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  const CourseFields = {
    title,
  };

  let course;
  try {
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: CourseFields },
      { new: true, useFindAndModify: false }
    );
    if (!course) {
      const status = 404;
      return res.status(status).json({ msg: "Item not found", status });
    }
    res.status(200).json(course);
  } catch (err) {
    console.error(err);
  }
});

// delete Course
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  try {
    let status = 200;
    const found = await Course.findByIdAndDelete(id);
    if (!found) {
      status = 404;
      return res.status(status).json({ msg: "Item not found", status });
    }
    res.status(status).json({ msg: `Item ${id} deleted`, status });
  } catch (err) {
    console.error(err);
  }
});

// Filter all students with specific course
router.get("/:title/students", async (req, res) => {
  const { title: courseTitle } = req.params;
  let status = 200;

  try {
    Course.findOne(
      { title: new RegExp(courseTitle, "i") },
      async (error, course) => {
        if (error) {
          status = 500;
          console.error(error);
          return res.status(status).json({ msg: "Server error", status });
        }

        if (!course) {
          status = 404;
          return res.status(status).json({ msg: "Item not found", status });
        }

        const { students } = await course.populate("students");
        const result = students.map(({ _id, name }) => ({
          id: _id.toString(),
          name,
        }));
        res.status(200).json(result);
      }
    );
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
