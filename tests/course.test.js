const app = require("../server");
const request = require("supertest");
const { initializeDatabase, clearDatabase } = require("../seeds");
const Course = require("../schemas/Course");

beforeAll(() => {
  initializeDatabase();
});

afterAll(() => {
  clearDatabase();
});

describe("test Course endpoints", () => {
  it("Should respond with json", (done) => {
    request(app)
      .get("/api/courses")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  it(`Should POST /api/courses: creates course 'Vue'`, (done) => {
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

  it(`Should DELETE /api/courses Pick course 'React' and delete it`, async () => {
    const course = await Course.findOne({ title: "React" });
    const res = await request(app).delete(
      `/api/courses/${course._id.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/deleted/);
    const result = await Course.findOne({ title: "React" });
    expect(result).toBeNull();
  });

  it(`Should GET /api/courses/:id : Get single course 'NodeJS' by id`, async () => {
    const course = await Course.findOne({ title: "NodeJS" });
    const res = await request(app).get(`/api/courses/${course._id.toString()}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(Object.keys(res.body).sort()).toEqual(
      ["_id", "title", "__v"].sort()
    );
    expect(res.body.title).toBe("NodeJS");
    expect(typeof res.body.title).toBe("string");
  });

  it(`Should return status 400 on GET /api/courses/:id : Id not valid`, async () => {
    const res = await request(app).get(`/api/courses/some-random-faulty-id`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Id not valid", status: 400 });
  });

  it(`Should return status 404 on GET /api/courses/:id : Item not found`, async () => {
    const res = await request(app).get(`/api/courses/617b7232a5e5e6c28a992cb7`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: "Item not found", status: 404 });
  });

  it(`Should PUT /api/courses/:id : Update course title 'SQL' to 'James'`, async () => {
    const course = await Course.findOne({ title: "SQL" });
    const payload = { title: "GraphQL" };
    const res = await request(app)
      .put(`/api/courses/${course._id.toString()}`)
      .set("Content-type", "application/json")
      .send({ ...payload });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("GraphQL");
  });
});
