const mongoose = require("mongoose");

const StudentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courses: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Course",
    },
  ],
});

module.exports = mongoose.model("Student", StudentSchema);
