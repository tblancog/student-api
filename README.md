# School registration system

This is a simple api that handles all CRUD operations that exist in two entities: Student and Course.

## Installation

First clone this repo and enter commands below.

Start containerized mongodb database using docker compose

```bash
docker-compose up -d
```

Install dependencies

```bash
npm install
```

## Usage

Start server on port 8000

```bash
npm run start
```

### Mock data

Create mock data

```
POST /api/mock
```

Delete mock data

```
DELETE /api/mock
```

### Student endpoints and payloads

#### Create a student

```
POST /api/students
Content-Type: application/json

{
    "name": "Tony"
}
```

#### Get a list of created students

```
GET /api/students
```

#### Get a single student

```
GET /api/students/{studentId}
```

#### Update a student

```
PUT /api/students/{studentId}
Content-Type: application/json

{
    "name": "John"
}
```

#### Delete a student

```
DELETE /api/students/{studentId}
```

#### Enroll student into a course

```
PUT /api/students/{studentId}/enroll
Content-Type: application/json

{
    "id": "some-existing-course-id"
}
```

#### Filter all students without any courses

```
GET /api/students/no-courses
```

#### Filter students with a specific course

Note: An authorization token is required to simulate ability of an admin to filter, otherwise it will lead to an 403 error: 'Only admins can filter'

```
GET /api/students?course=React
Authorization: Bearer some-random-token
```

### Course endpoints and payloads

#### Create a course

```
POST /api/courses
Content-Type: application/json

{
    "title": "Scala"
}
```

#### Get a list of created courses

```
GET /api/courses
```

#### Get a single course

```
GET /api/courses/{courseId}
```

#### Update a course

```
PUT /api/courses/{courseId}
Content-Type: application/json

{
    "name": "Scala"
}
```

#### Delete a course

```
DELETE /api/courses/{courseId}
```

#### Filter all courses without any students

```
GET /api/courses/no-students
```

#### Filter courses for a specific student

Note: An authorization token is required to simulate ability of an admin to filter, otherwise it will lead to an 403 error: 'Only admins can filter'

```
GET /api/courses?student=John
Authorization: Bearer some-random-token
```

## Tests

```bash
npm run test
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
