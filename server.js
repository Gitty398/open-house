
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require("morgan")
const methodOverride = require("method-override")
const authRoutes = require("./controllers/auth")
const session = require("express-session")
const MongoStore = require("connect-mongo")

// Middleware

require("./db/connection")
app.use(morgan("tiny"))
app.use(methodOverride("_method"))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
})
);


// Routes

// Home

app.get("/", (req, res) => {
    res.render("index.ejs", {
        user: req.session.user
    })
})


app.use("/auth", authRoutes)


// Routes below require sign-in

app.use((req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect("/")
    }
})


app.get("/vip-lounge", (req, res) => {
    if (req.session.user) {
        res.send(`Welcome to the party ${req.session.user.username}`)
    } else {
        res.send("Sorry no guests allowed")
    }
})


app.listen(PORT, () => {
    console.log("Running on", PORT)
})


