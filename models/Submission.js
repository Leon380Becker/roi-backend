const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  name: String,
  email: String,
});

// Force collection name to "submissions"
module.exports = mongoose.model("Submission", submissionSchema, "submissions");
