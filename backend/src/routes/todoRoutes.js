const express = require("express");
const {
  createTodo,
  updateTodo,
  getTodo,
  getAllTodos,
  deleteTodo,
  getTodosByUserId,
  dummyNotification,
} = require("../controllers/todoController");
const router = express.Router();

router.post("/create", createTodo);
router.post("/update", updateTodo);
router.post("/delete", deleteTodo);
router.get("/todo", getTodo);
router.get("/todos", getAllTodos);
router.get("/assigned_todos", getTodosByUserId);
router.get("/test", dummyNotification);

module.exports = router;

