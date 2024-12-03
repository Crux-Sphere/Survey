const express = require("express");
const cors = require("cors");
// const fileUpload = require("express-fileupload");
const path = require("path");
const morgan = require("morgan");

const surveyRoutes = require("./src/routes/surveyRoute");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoute");
const chatRoomRoutes = require("./src/routes/chatRoomRoute");
const responseRoutes = require("./src/routes/responseRoute");
const familyRoutes = require("./src/routes/familyRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const dataRoutes = require("./src/routes/dataRoutes");
const todoRoutes = require("./src/routes/todoRoutes")
const contactRoutes = require("./src/routes/contactRoutes")
const dashboardRoutes = require("./src/routes/dashboardRoutes")

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use(fileUpload());
app.use(cors({ origin: "*" , exposedHeaders: ["Content-Disposition"]}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/survey/", surveyRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chatroom", chatRoomRoutes);
app.use("/api/response", responseRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/contact",contactRoutes);
app.use("/api/dashboard",dashboardRoutes);

app.use(express.static(path.join(__dirname, "../frontend/out/")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/out/index.html")),
);

module.exports = app;
