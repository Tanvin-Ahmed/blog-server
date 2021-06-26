import mongoose from "mongoose";

export const blog_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
  },
  like: {
    type: Array,
    default: [],
    required: true,
  },
  comments: {
    type: Array,
    default: [],
    required: true,
  },
  uploadedTime: {
    type: Date,
    required: true,
  },
});
