const express = require("express");
const route = express.Router();
const Todo = require("../models/todoModel");

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/user/login");
}

route.use(isAuthenticated);

route.get("/", async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.render("home", { todos, currentUser: req.user, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).render("home", {
            todos: [],
            currentUser: req.user,
            error: "Could not load your tasks.",
        });
    }
});

route.get("/new", (req, res) => {
    res.render("new", { currentUser: req.user, error: null });
});

route.get("/:id/more", async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
        if (!todo) {
            return res.status(404).render("home", {
                todos: [],
                currentUser: req.user,
                error: "Task not found.",
            });
        }
        res.render("more", { todo, currentUser: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).render("home", {
            todos: [],
            currentUser: req.user,
            error: "Something went wrong.",
        });
    }
});

route.post("/", async (req, res) => {
    const { title, description } = req.body || {};
    const completed = req.body.completed === "on";

    if (!title || !description) {
        return res.status(400).render("new", {
            currentUser: req.user,
            error: "Title and description are required",
            values: { title, description, completed },
        });
    }

    try {
        await Todo.create({
            title,
            description,
            completed,
            user: req.user._id,
        });
        res.redirect("/todo");
    } catch (error) {
        console.error(error);
        res.status(500).render("new", {
            currentUser: req.user,
            error: "Could not create task. Please try again.",
            values: { title, description, completed },
        });
    }
});

route.get("/:id/edit", async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
        if (!todo) {
            return res.status(404).render("home", {
                todos: [],
                currentUser: req.user,
                error: "Task not found.",
            });
        }
        res.render("edit", { todo, currentUser: req.user, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).render("home", {
            todos: [],
            currentUser: req.user,
            error: "Something went wrong.",
        });
    }
});

route.put("/:id", async (req, res) => {
    const { title, description } = req.body || {};
    const completed = req.body.completed === "on";

    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
        if (!todo) {
            return res.status(404).render("home", {
                todos: [],
                currentUser: req.user,
                error: "Task not found.",
            });
        }

        if (!title || !description) {
            return res.status(400).render("edit", {
                todo,
                currentUser: req.user,
                error: "Title and description are required",
            });
        }

        todo.title = title;
        todo.description = description;
        todo.completed = completed;
        todo.updatedAt = Date.now();
        await todo.save();

        res.redirect("/todo");
    } catch (error) {
        console.error(error);
        res.status(500).render("edit", {
            todo: { _id: req.params.id, title, description, completed },
            currentUser: req.user,
            error: "Could not update task. Please try again.",
        });
    }
});

route.delete("/:id/delete", async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!todo) {
            return res.status(404).render("home", {
                todos: [],
                currentUser: req.user,
                error: "Task not found.",
            });
        }
        res.redirect("/todo");
    } catch (error) {
        console.error(error);
        res.status(500).render("home", {
            todos: [],
            currentUser: req.user,
            error: "Could not delete task.",
        });
    }
});

module.exports = route;
