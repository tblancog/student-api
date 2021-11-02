const Course = require("../schemas/Course");
const Student = require("../schemas/Student");

const studentList = [
  { name: "John", courses: [] },
  { name: "Jane", courses: [] },
  { name: "Jimmy", courses: [] },
];
const coursesList = [
  { title: "React", students: [] },
  { title: "NodeJS", students: [] },
  { title: "SQL", students: [] },
  { title: "PHP", students: [] },
  { title: "MongoDB", students: [] },
  { title: "Angular", students: [] },
  { title: "NestJS", students: [] },
  { title: "NextJS", students: [] },
  { title: "Java", students: [] },
];

const initializeDatabase = async () => {
  await Student.insertMany(studentList);
  await Course.insertMany(coursesList);
};

const clearDatabase = async () => {
  await Student.deleteMany({});
  await Course.deleteMany({});
};

module.exports = {
  initializeDatabase,
  clearDatabase,
};
