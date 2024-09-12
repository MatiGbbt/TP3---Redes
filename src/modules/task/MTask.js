// task.service.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new mongoose.Schema({
  name: String,
  description: String,
  user: { type: Schema.Types.ObjectId, ref: "User" },
  resume: String,
});

const taskModel = mongoose.model("Task", taskSchema);

export default taskModel;
