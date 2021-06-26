import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { login_schema } from "../schema/login_schema";
import { admin_schema } from "../schema/admin_schema";

dotenv.config();

const router = express.Router();

const Account = mongoose.model(
  `${process.env.USER_ACCOUNT_COLLECTION}`,
  login_schema
);

const Admin = mongoose.model(
  `${process.env.ADMIN_ACCOUNT_COLLECTION}`,
  admin_schema
);

router.post("/sign-up", (req, res) => {
  const img = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const newImg = img.data;
  const encImg = newImg.toString("base64");
  const image = {
    contentType: img.mimetype,
    size: img.size,
    img: Buffer.from(encImg, "base64"),
  };

  const signUp = {
    name,
    email,
    password,
    image,
  };

  const newUser = new Account(signUp);
  newUser.save((err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(result);
    }
  });
});

router.post("/find-user", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Account.findOne({ email }, (err, account) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      if (password) {
        if (account.password === password) {
          res.status(200).send(account);
        } else {
          res.status(404).send("password was not match");
        }
      } else {
        res.status(200).send(account);
      }
    }
  });
});

router.post("/add-admin", (req, res) => {
  const email = req.body;

  const newAdmin = new Admin(email);
  newAdmin.save((err, admin) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(200).send(admin);
    }
  });
});

router.get("/find-admin/:email", (req, res) => {
  const email = req.params.email;
  Admin.findOne({ email }, (err, admin) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(200).send(admin);
    }
  });
});

export default router;
