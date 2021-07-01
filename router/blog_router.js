import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { blog_schema } from "../schema/blog_schema";

dotenv.config();

const router = express.Router();

const Blog = mongoose.model(`${process.env.BLOGS_COLLECTION}`, blog_schema);

let post_id = null;
let deleted_id = null;
let updated_id = null;
let comment_id = null;
let like_id = null;
export const getUpdates = (socket) => {
  const newUpdate = mongoose.connection
    .collection(`${process.env.BLOGS_COLLECTION}`)
    .watch();
  newUpdate.on("change", (change) => {
    // console.log(change);
    if (change.operationType === "delete") {
      if (deleted_id !== change?.documentKey?._id) {
        deleted_id = change?.documentKey?._id;
        socket.emit("deleted-blog-id", change.documentKey);
      }
    } else if (change.operationType === "update") {
      if (
        !change?.updateDescription?.updatedFields?.like &&
        !change?.updateDescription?.updatedFields?.comments
      ) {
        if (updated_id !== change?.documentKey?._id) {
          updated_id = change?.documentKey?._id;
          socket.emit("updated-blog-data", {
            _id: change?.documentKey?._id,
            ...change?.updateDescription?.updatedFields,
          });
        }
      } else if (change?.updateDescription?.updatedFields?.comments) {
        if (comment_id !== change?.documentKey?._id) {
          comment_id = change?.documentKey?._id;
          const comments = change?.updateDescription?.updatedFields?.comments;
          // console.log(comments[comments.length - 1]);
          socket.emit("find-a-new-comment", {
            _id: change?.documentKey?._id,
            comments,
          });
        }
      } else if (change?.updateDescription?.updatedFields?.like) {
        if (like_id !== change?.documentKey?._id) {
          like_id = change?.documentKey?._id;
          const likes = change?.updateDescription?.updatedFields?.like;

          socket.emit("find-new-like", {
            _id: change?.documentKey?._id,
            likes,
          });
        }
      }
    } else if (change.operationType === "insert") {
      if (post_id !== change?.documentKey?._id) {
        post_id = change?.documentKey?._id;

        socket.emit("upload-new-blog", change.fullDocument);
      }
    }
  });
};

router.post("/upload", (req, res) => {
  const img = req.files.file;
  const newImg = img.data;
  const encImg = newImg.toString("base64");
  const image = {
    contentType: img.mimetype,
    size: img.size,
    img: Buffer.from(encImg, "base64"),
  };

  const blogData = {
    title: req.body.title,
    author: req.body.author,
    content: req.body.content,
    image,
    like: [],
    comments: [],
    uploadedTime: req.body.uploadedTime,
  };

  const newBlog = new Blog(blogData);
  newBlog.save((err, blog) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(200).send(blog);
    }
  });
});

router.get("/find-all-blogs", (req, res) => {
  Blog.find((err, blogs) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(200).send(blogs);
    }
  });
});

router.get("/find-blog/:id", (req, res) => {
  Blog.findOne({ _id: req.params.id }, (err, blog) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(200).send(blog);
    }
  });
});

router.put("/update-blog", (req, res) => {
  Blog.updateOne(
    { _id: req.body._id },
    {
      $set: {
        title: req.body.title,
        author: req.body.author,
        content: req.body.content,
        uploadedTime: req.body.uploadedTime,
      },
    },
    (err, blog) => {
      if (err) {
        res.status(404).send(err.message);
      } else {
        res.status(200).send(blog);
      }
    }
  );
});

router.put("/upload-comment/:id", (req, res) => {
  const comment = req.body;
  const id = req.params.id;
  Blog.updateOne(
    { _id: id },
    {
      $addToSet: { comments: comment },
    },
    (err, update) => {
      if (err) {
        res.status(404).send(err.message);
      } else {
        res.status(200).send(update);
      }
    }
  );
});

router.put("/upload-like/:id", (req, res) => {
  const email = req.body;
  Blog.updateOne(
    { _id: req.params.id },
    {
      $addToSet: { like: email },
    },
    (err, update) => {
      if (err) {
        res.status(404).send(err.message);
      } else {
        res.status(200).send(update);
      }
    }
  );
});

router.put("/upload-unlike/:id", (req, res) => {
  const email = req.body.email;

  Blog.updateOne(
    { _id: req.params.id },
    {
      $pull: { like: { email } },
    },
    (err, update) => {
      if (err) {
        res.status(404).send(err.message);
      } else {
        res.status(200).send(update);
      }
    }
  );
});

router.delete("/delete-blog/:id", (req, res) => {
  Blog.deleteOne({ _id: req.params.id }, (err, result) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      console.log(result);
      res.status(200).send(result);
    }
  });
});

export default router;
