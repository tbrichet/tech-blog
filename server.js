// Third Party Programs
const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const path = require("path");
const app = express();
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Internal Pages
const sequelize = require("./config/connection");

// PORT
const PORT = process.env.PORT || 3001;

// Express Session Settings
const expressSession = {
    secret: 'keyboard cat',
    cookie: {},
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};

// Express Session Middleware
app.use(session(expressSession));

// Express Handlebars Helpers
const hbHelpers = exphbs.create({
    helpers: {
        format_date: date => {
            return `${date.getMonth() + 1}/${date.getDate()}/$${date.getFullYear()}`;
        }
    }
});

// Middleware Functions
app.engine("handlebars", hbHelpers.engine);
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(require("./controllers/api/routes"));

// Listener for Server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    sequelize.sync({ force: false });
});
