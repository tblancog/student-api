const app = require("../server");
const request = require("supertest");
const Course = require("../schemas/Course");
const Student = require("../schemas/Student");

test("Should respond with json", (done) => {
  request(app)
    .get("/api/courses")
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(200, done);
});

test(`Should POST /api/courses: creates course 'Vue'`, (done) => {
  const payload = {
    title: "Vue",
  };
  request(app)
    .post("/api/courses")
    .set("Content-type", "application/json")
    .send({ ...payload })
    .end((err, res) => {
      if (err || !res.ok) {
        done({ err });
      } else {
        expect(res.status).toBe(201);
        expect(Object.keys(res.body)).toContain("title");
        expect(res.body.title).toBe("Vue");
        done();
      }
    });
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
