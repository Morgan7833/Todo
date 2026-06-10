const express = require("express");
const route = express.Router();
const passport = require("passport");
const User = require("../models/userModel");

route.get("/register", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/todo");
    res.render("user/register", { error: null, success: null });
});

route.post("/register", async (req, res) => {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
        return res.status(400).render("user/register", {
            error: "All fields are required",
            success: null,
            values: { username, email },
        });
    }

    if (password.length < 6) {
        return res.status(400).render("user/register", {
            error: "Password must be at least 6 characters",
            success: null,
            values: { username, email },
        });
    }

    try {
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(400).render("user/register", {
                error: "Email already registered",
                success: null,
                values: { username, email },
            });
        }

        await User.create({ username, email, password });
        res.redirect("/user/login?registered=1");
    } catch (error) {
        console.error(error);
        res.status(500).render("user/register", {
            error: "Something went wrong. Please try again.",
            success: null,
            values: { username, email },
        });
    }
});

route.get("/login", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/todo");
    res.render("user/login", {
        error: null,
        success: req.query.registered ? "Account created! You can log in now." : null,
    });
});

route.post("/login", (req, res, next) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).render("user/login", {
            error: "All fields are required",
            success: null,
        });
    }

    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(400).render("user/login", {
                error: info?.message || "Invalid email or password",
                success: null,
            });
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            res.redirect("/todo");
        });
    })(req, res, next);
});

route.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/user/login");
    });
});

module.exports = route;
