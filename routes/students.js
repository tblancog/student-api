const express = require("express");
const Course = require("../schemas/Course");
const router = express.Router();
const Student = require("../schemas/Student");
const mongoose = require("mongoose");
mongoose.set("debug", false);
const MAX_COURSES_PER_STUDENT = 5;
const MAX_STUDENTS_PER_COURSE = 50;

// get all students
router.get("/", async (req, res) => {
  // If token exists then it can filter by course
  let token = "";
  if ("authorization" in req.headers) {
    token = req.headers["authorization"].split(" ")[1];
  }
  let course;
  if (req.query.course && token) {
    course = await Course.find({
      title: { $regex: req.query.course, $options: "i" },
    });
  } else if (req.query.course && !token) {
    const status = 403;
    return res.status(status).json({ msg: "Only admins can filter", status });
  }

  try {
    const students = await Student.find({
      ...(course && { courses: course }),
    });
    res
      .status(200)
      .json(
        students?.map(({ _id, name, courses }) => ({ id: _id, name, courses }))
      );
  } catch (err) {
    console.error(err);
  }
});

router.get("/no-courses", async (req, res) => {
  try {
    const students = await Student.find({
      courses: { $exists: true, $size: 0 },
    });
    res
      .status(200)
      .json(
        students?.map(({ _id, name, courses }) => ({ id: _id, name, courses }))
      );
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
  const newStudent = new Student({ name, courses: [] });
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

// Enroll in course
router.put("/:id/enroll", async (req, res) => {
  const { id } = req.params;
  const { id: courseId } = req.body;
  let status = 200;

  // Check wether the student is valid
  if (!id.match(/^[0-9a-fA-F]{24}$/) || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
    status = 400;
    return res.status(status).json({ msg: "Id not valid", status });
  }
  try {
    // Fetch course
    const course = await Course.findById(courseId);

    // // Check if student exists
    Student.findById(id, function (error, student) {
      if (error) {
        status = 500;
        return res.status(status).json({ msg: "Server error", status });
      }

      // Check if student exists
      if (!student) {
        status = 404;
        return res.status(status).json({ msg: "Student not found", status });
      }
      // Check if course exists
      if (!course) {
        status = 404;
        return res.status(status).json({ msg: "Course not found", status });
      }

      // Check if student is already enrolled
      const isAlreadyEnrolled = student.courses.find(
        (c) => c.toString() === course._id.toString()
      );
      if (isAlreadyEnrolled) {
        status = 409;
        return res.status(status).json({ msg: "Already enrolled", status });
      }

      // Check if student enrolled for more than 5 courses
      if (student.courses.length >= MAX_COURSES_PER_STUDENT) {
        status = 400;
        return res.status(status).json({
          msg: "Student reached the limit for course enrollement",
          status,
        });
      }

      if (course.students.length >= MAX_STUDENTS_PER_COURSE) {
        status = 400;
        return res.status(status).json({
          msg: "Course reached the limit for students to enroll",
          status,
        });
      }

      student.courses.push(course);
      student.save();

      course.students.push(student);
      course.save();
      res
        .status(status)
        .json({ msg: `Student ${id} enrolled successfully`, status });
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
