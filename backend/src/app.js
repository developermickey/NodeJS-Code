const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRouter = require("./routes/auth.route");
app.use("/api/auth", authRouter);

module.exports = app;
