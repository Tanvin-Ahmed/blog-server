import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import login_router from "./router/login_router";
import blog_router, { getUpdates } from "./router/blog_router";
import fileUpload from "express-fileupload";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: true,
});

const uri = `mongodb://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0-shard-00-00.zhub4.mongodb.net:27017,cluster0-shard-00-01.zhub4.mongodb.net:27017,cluster0-shard-00-02.zhub4.mongodb.net:27017/${process.env.DATABASE_NAME}?ssl=true&replicaSet=atlas-5oevi0-shard-0&authSource=admin&retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("database connection established");

    io.on("connection", (socket) => {
      getUpdates(socket);
    });
  })
  .catch((err) => console.log(err.message));

app.get("/", (req, res) => {
  res.status(200).send(`<h1>Node.js</h1>`);
});
app.use("/user", login_router);
app.use("/blog", blog_router);

httpServer.listen(process.env.PORT || 5000);
