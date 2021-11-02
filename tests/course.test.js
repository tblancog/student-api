const app = require("../server");
const request = require("supertest");
const Course = require("../schemas/Course");
const Student = require("../schemas/Student");
const { initializeDatabase, clearDatabase } = require("../seeds");

beforeAll(() => {
  initializeDatabase();
});

afterAll(() => {
  clearDatabase();
});

describe("Course tests", () => {
  test("Should respond with json", (done) => {
    request(app)
      .get("/api/courses")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  test("Should get a list of courses", async () => {
    const res = await request(app)
      .get("/api/courses")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          students: expect.any(Array),
        }),
      ])
    );
  });

  test("Should filter courses by specific student", async () => {
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
      .get(`/api/courses?student=${st2.name}`)
      .set("Authorization", "Bearer <some-fake-valid-token>");

    expect(resCourses.status).toBe(200);

    // Match the result with the filtered student
    for (const c of resCourses.body) {
      expect(c.students).toContain(st2._id.toString());
    }
  });

  test("Restrict filtering if a token is not passed", async () => {
    const res = await request(app).get(`/api/courses?student=John`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      msg: "Only admins can filter",
      status: 403,
    });
  });

  test("Should show only courses without any students", async () => {
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

    // Get only courses without students
    const res = await request(app).get(`/api/courses/no-students`);
    expect(res.status).toBe(200);

    // It should not get any courses
    for (const c of res.body) {
      expect(c.students.length).toBe(0);
      expect(c.title).not.toBe("NodeJS");
    }
  });

  test(`Should POST /api/courses: creates course 'Vue'`, async () => {
    const payload = {
      title: "Vue",
    };
    const res = await request(app)
      .post("/api/courses")
      .set("Content-type", "application/json")
      .send({ ...payload });

    expect(res.status).toBe(201);
    expect(Object.keys(res.body)).toContain("title");
    expect(res.body.title).toBe("Vue");
  });

  test(`Should DELETE /api/courses : create course 'Svelte' and delete it`, async () => {
    const course = new Course({ title: "Svelte" });
    await course.save();
    const res = await request(app).delete(
      `/api/courses/${course._id.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/deleted/);
    const result = await Course.findOne({ title: "Svelte" });
    expect(result).toBeNull();
  });

  test(`Should GET /api/courses/:id : Get single course 'Laravel' by id`, async () => {
    const course = new Course({ title: "Laravel" });
    await course.save();
    const res = await request(app).get(`/api/courses/${course._id.toString()}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(Object.keys(res.body).sort()).toEqual(
      ["_id", "title", "__v", "students"].sort()
    );
    expect(res.body.title).toBe("Laravel");
    expect(typeof res.body.title).toBe("string");
  });

  test(`Should return status 400 on GET /api/courses/:id : Id not valid`, async () => {
    const res = await request(app).get(`/api/courses/some-random-faulty-id`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Id not valid", status: 400 });
  });

  test(`Should return status 404 on GET /api/courses/:id : Item not found`, async () => {
    const res = await request(app).get(`/api/courses/617b7232a5e5e6c28a992cb7`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: "Item not found", status: 404 });
  });

  test(`Should PUT /api/courses/:id : Update course title 'SQL' to 'GraphQL'`, async () => {
    const course = new Course({ title: "SQL" });
    await course.save();
    const payload = { title: "GraphQL" };
    const res = await request(app)
      .put(`/api/courses/${course._id.toString()}`)
      .set("Content-type", "application/json")
      .send({ ...payload });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("GraphQL");
  });

  test("Should GET /api/courses/:id/students : Get all students from specific course", async () => {
    const students = await Student.insertMany([
      { name: "Tommy" },
      { name: "Jim" },
      { name: "Carl" },
    ]);

    const course = new Course({
      title: ".NET",
      students,
    });
    await course.save();

    // 3 students eenroll on the same course
    for (const student of students) {
      await request(app).get(`/api/student/${student._id.toString()}/enroll`);
    }
    const res = await request(app).get(`/api/courses/${course.title}/students`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      ])
    );
  });
});
