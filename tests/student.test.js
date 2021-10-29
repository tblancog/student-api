const app = require("../server");
const request = require("supertest");
const { initializeDatabase, clearDatabase } = require("../seeds");
const Student = require("../schemas/Student");

beforeAll(() => {
  initializeDatabase();
});

afterAll(() => {
  clearDatabase();
});

describe("test Student endpoints", () => {
  it("Should respond with json", (done) => {
    request(app)
      .get("/api/students")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  it(`Should POST /api/students: creates student 'Joseph'`, (done) => {
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

  it(`Should DELETE /api/students Pick student 'John' and delete it`, async () => {
    const student = await Student.findOne({ name: "John" });
    const res = await request(app).delete(
      `/api/students/${student._id.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/deleted/);
    const result = await Student.findOne({ name: "John" });
    expect(result).toBeNull();
  });

  it(`Should GET /api/students/:id : Get single student 'Jane' by id`, async () => {
    const student = await Student.findOne({ name: "Jane" });
    const res = await request(app).get(
      `/api/students/${student._id.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(Object.keys(res.body).sort()).toEqual(["_id", "name", "__v"].sort());
    expect(res.body.name).toBe("Jane");
    expect(typeof res.body.name).toBe("string");
  });

  it(`Should return status 400 on GET /api/students/:id : Id not valid`, async () => {
    const res = await request(app).get(`/api/students/some-random-faulty-id`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: "Id not valid", status: 400 });
  });

  it(`Should return status 404 on GET /api/students/:id : Item not found`, async () => {
    const res = await request(app).get(
      `/api/students/617b7232a5e5e6c28a992cb7`
    );
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ msg: "Item not found", status: 404 });
  });

  it(`Should PUT /api/students/:id : Update student name 'Jimmy' to 'James'`, async () => {
    const student = await Student.findOne({ name: "Jimmy" });
    const payload = { name: "James" };
    const res = await request(app)
      .put(`/api/students/${student._id.toString()}`)
      .set("Content-type", "application/json")
      .send({ ...payload });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("James");
  });
});
