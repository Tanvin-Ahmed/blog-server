import mongoose from "mongoose";

export const admin_schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
});
