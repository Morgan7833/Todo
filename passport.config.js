const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/userModel");

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user) {
                return done(null, false, { message: "No account with that email" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (match) return done(null, user);
            return done(null, false, { message: "Incorrect password" });
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}

module.exports = initialize;
