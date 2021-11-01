const Course = require("../schemas/Course");
const Student = require("../schemas/Student");

const studentList = [{ name: "John" }, { name: "Jane" }, { name: "Jimmy" }];
const coursesList = [
  { title: "React" },
  { title: "NodeJS" },
  { title: "SQL" },
  { title: "PHP" },
  { title: "MongoDB" },
  { title: "Angular" },
  { title: "NestJS" },
  { title: "NextJS" },
  { title: "Java" },
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
