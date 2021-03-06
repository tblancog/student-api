const app = require("../server");
const request = require("supertest");
const { initializeDatabase, clearDatabase } = require("../seeds");
const Student = require("../schemas/Student");
const Course = require("../schemas/Course");

beforeAll(() => {
  initializeDatabase();
});

afterAll(() => {
  clearDatabase();
});

describe("Student tests", () => {
  test("Should respond with json", (done) => {
    request(app)
      .get("/api/students")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });
  test("Should get a list of students", async () => {
    const res = await request(app)
      .get("/api/students")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          courses: expect.any(Array),
        }),
      ])
    );
  });

  test("Should filter students by specific course", async () => {
    // Enroll two students in course
    const course = new Course({ title: "Symfony" });
    course.save();

    const st1 = new Student({ name: "Tommy" });
    const st2 = new Student({ name: "Vinnie" });
    await Student.insertMany([st1, st2]);

    const res1 = await request(app)
      .put(`/api/students/${st1._id.toString()}/enroll`)
      .send({ id: course._id.toString() });

    const res2 = await request(app)
      .put(`/api/students/${st2._id.toString()}/enroll`)
      .send({ id: course._id.toString() });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Get courses for Vinnie only
    const resCourses = await request(app)
      .get(`/api/students?course=${course.title}`)
      .set({ Authorization: "Bearer <some-fake-valid-token>" });
    expect(resCourses.status).toBe(200);

    // Match the result with the filtered student
    for (const c of resCourses.body) {
      expect(c.courses).toContain(course._id.toString());
    }
  });

  test("Restrict filtering if a token is not passed", async () => {
    const res = await request(app).get(`/api/students?course=React`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      msg: "Only admins can filter",
      status: 403,
    });
  });

  test("Should show only students without any course", async () => {
    // Pick and enroll student to NodeJS
    const enrolledStudent = await new Student({
      name: "enrolled student",
    }).save();

    // Pick nodeJS
    const nodeJsCourse = await Course.findOne({ title: "NodeJS" });

    // Enroll
    await request(app)
      .put(`/api/students/${enrolledStudent._id.toString()}/enroll`)
      .send({ id: nodeJsCourse._id.toString() });

    // Get only students with courses
    const res = await request(app).get(`/api/students/no-courses`);
    expect(res.status).toBe(200);

    // Match the result with the filtered student
    for (const c of res.body) {
      expect(c.courses.length).toBe(0);
      expect(c.title).not.toBe("enrolled student");
    }
  });

  test(`Should POST /api/students: creates student 'Joseph'`, (done) => {
    const payload = {
      name: "Joseph",
    };
    request(app)
      .post("/api/students")
      .set("Content-type", "application/json")
      .send({ ...payload })
      .end((err, res) => {
        if (err || !res.ok) {
          done({ err });
        } else {
          expect(res.status).toBe(201);
          expect(Object.keys(res.body)).toContain("name");
          expect(res.body.name).toBe("Joseph");
          done();
        }
      });
  });

  test(`Should DELETE /api/students : Create some 'Some new student' and delete it`, async () => {
    const newStudent = new Student({
      name: "Some new student",
    });
    await newStudent.save();
    const res = await request(app).delete(
      `/api/students/${newStudent._id.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/deleted/);
    const result = await Student.findOne({ name: "Some new student" });
    expect(result).toBeNull();
  });

  test(`Should GET /api/students/:id : Get single student 'Jane' by id`, async () => {
    const student = await Student.findOne({ name: "Jane" });
    const res = await request(app).get(
      `/api/students/${student._id.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(Object.keys(res.body).sort()).toEqual(
      ["_id", "name", "__v", "courses"].sort()
    );
    expect(res.body.name).toBe("Jane");
    expect(typeof res.body.name).toBe("string");
  });

  test(`Should return status 400 on GET /api/students/:id : Id not valid`, async () => {
    const res = await request(app).get(`/api/students/some-random-faulty-id`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Id not valid", status: 400 });
  });

  test(`Should return status 404 on GET /api/students/:id : Item not found`, async () => {
    const res = await request(app).get(
      `/api/students/617b7232a5e5e6c28a992cb7`
    );
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: "Item not found", status: 404 });
  });

  test(`Should PUT /api/students/:id : Update student name 'Jimmy' to 'James'`, async () => {
    const student = await Student.findOne({ name: "Jimmy" });
    const payload = { name: "James" };
    const res = await request(app)
      .put(`/api/students/${student._id.toString()}`)
      .set("Content-type", "application/json")
      .send({ ...payload });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("James");
  });

  test(`Should return status 400 on PUT /api/students/:id/enroll : Id not valid`, async () => {
    const res = await request(app).put(
      `/api/students/some-random-faulty-id/enroll`
    );
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Id not valid", status: 400 });
  });

  test(`Should return status 404 on PUT /api/students/:id/enroll : Student not found`, () => {
    const payload = { id: "617b7232a5e5e6c28a992cb7" };

    request(app)
      .put("/api/students/617b7232a5e5e6c28a992cb7/enroll")
      .send({ ...payload })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Student not found");
      });
  });

  test(`Should return status 404 on PUT /api/students/:id/enroll : Course not found`, async () => {
    // Invalid course id
    const payload = { id: "617b7232a5e5e6c28a992cb7" };

    // Get a valid student
    const student = await Student.findOne({ name: "Jane" });

    request(app)
      .put(`/api/students/${student._id.toString()}/enroll`)
      .send({ ...payload })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Course not found");
      });
  });

  test(`Should PUT /api/students/:id/enroll : enroll student 'Jane' in 'React course'`, async () => {
    // Pick student 'Jane'
    let student = await Student.findOne({
      name: "Jane",
    });
    await student.save();

    // Get react course
    const course = await Course.findOne({ title: "React" });

    const payload = { id: course._id.toString() };

    const res = await request(app)
      .put(`/api/students/${student._id.toString()}/enroll`)
      .send({ ...payload });
    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/enrolled successfully/);

    // Check student "Jane" again to see if it contains "React"
    student = await Student.findOne({ name: "Jane" });
    expect(
      student.courses.find((c) => c._id.toString() === course._id.toString())
    ).toBeTruthy();
  });

  test(`Should PUT /api/students/:id/enroll : Student reaches the limit for course enrollement`, async () => {
    // Get 5 courses
    const courses = await Course.find({
      title: { $in: ["NodeJS", "SQL", "PHP", "MongoDB", "Angular"] },
    });

    // Add 5 courses to some new Student
    const student = new Student({
      name: "Some student",
      courses,
    });
    await student.save();

    const djangoCourse = new Course({
      title: "Django",
    });
    await djangoCourse.save();

    const res = await request(app)
      .put(`/api/students/${student._id.toString()}/enroll`)
      .send({ id: djangoCourse._id.toString() });
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe(
      "Student reached the limit for course enrollement"
    );
  });

  test("Should PUT /api/students/:id/enroll : Student is already enrolled in course", async () => {
    const graphqlCourse = new Course({
      title: "GraphQL",
    });
    await graphqlCourse.save();

    const student = new Student({
      name: "Some other student",
      courses: [graphqlCourse],
    });
    await student.save();

    // Try to entoll again to GraphQL
    const res = await request(app)
      .put(`/api/students/${student._id.toString()}/enroll`)
      .send({ id: graphqlCourse._id.toString() });
    expect(res.status).toBe(409);
    expect(res.body.msg).toBe("Already enrolled");
  });

  test("Should restrict when trying to enroll more than 50 students in a single course", async () => {
    const courseAtLimit = new Course({
      title: "courseAtLimit",
      students: Array.from(
        { length: 50 },
        (_, idx) => new Student({ name: `student${idx + 1}` })
      ),
    });
    courseAtLimit.save();

    // Pick existing student
    const janeStudent51 = await Student.findOne({ name: `Jane` });

    const res = await request(app)
      .put(`/api/students/${janeStudent51._id.toString()}/enroll`)
      .set("Content-type", "application/json")
      .send({ id: courseAtLimit._id.toString() });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe(
      "Course reached the limit for students to enroll"
    );
  });
});
