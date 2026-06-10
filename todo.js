const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const path = require("path");

const initialize = require("./passport.config");
const todoRoute = require("./routes/todoRoute");
const userRoute = require("./routes/userRoutes");

const app = express();

mongoose
    .connect("mongodb://localhost:27017/Todo")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("DB error:", err));

initialize(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    next();
});

app.get("/", (req, res) => res.redirect("/todo"));

app.use("/todo", todoRoute);
app.use("/user", userRoute);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Something went wrong.");
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
