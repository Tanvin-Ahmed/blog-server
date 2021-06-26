import mongoose from "mongoose";

export const login_schema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: {
    type: Object,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
