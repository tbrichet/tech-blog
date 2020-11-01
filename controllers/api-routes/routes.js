const router = require("express").Router();
const { Post, Comment, User } = require("../../models/");
const withAuth = require("../utils/auth");

// CREATE NEW USER
router.post("/", (req, res) => {
    User.create({
        username: req.body.username,
        password: req.body.password
    })
    .then(dbUserData => {
        req.session.save(() => {
            req.session.userId = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
  
            res.json(dbUserData);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// UPDATE USER
router.post("/login", (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(400).json({ message: 'Account not found. Please try again.' });
            return;
    }
  
    const validPassword = dbUserData.checkPassword(req.body.password);
  
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password. Please try again.' });
            return;
        }
  
        req.session.save(() => {
            req.session.userId = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
    
            res.json({ user: dbUserData, message: 'Login successful.' });
        });
    });
});

// DELETE USER
router.delete("/user/:id", (req, res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({ message: 'Account not found. Please try again.' });
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// LOGOUT USER
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

// CREATE USER POSTS
router.post("/", withAuth, (req, res) => {
    const body = req.body;
    // console.log(req.session.userId);
    Post.create({ ...body, userId: req.session.userId })
    .then(newPost => {
        res.json(newPost);
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

// UPDATE USER POSTS
router.put("/:id", withAuth, (req, res) => {
    Post.update(req.body, {
    where: {
        id: req.params.id
        }
    })
    .then(affectedRows => {
        if (affectedRows > 0) {
            res.status(200).end();
        } else {
            res.status(404).end();
        }
      })
    .catch(err => {
        res.status(500).json(err);
    });
});

// DELETE USER POSTS
router.delete("/:id", withAuth, (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(affectedRows => {
        if (affectedRows > 0) {
            res.status(200).end();
        } else {
            res.status(404).end();
        }
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

// GET ALL POSTS
router.get("/", withAuth, (req, res) => {
    Post.findAll({
        where: {
            userId: req.session.userId
    }
    })
    .then(dbPostData => {
        const posts = dbPostData.map((post) => post.get({ plain: true }));
        
        res.render("all-posts-admin", {
            layout: "dashboard",
            posts
        });
    })
    .catch(err => {
        console.log(err);
        res.redirect("login");
    });
});

// GET NEWEST POST
router.get("/new", withAuth, (req, res) => {
    res.render("new-post", {
        layout: "dashboard"
    });
});

// GET SPECIFIC POST BY ID
router.get("/edit/:id", withAuth, (req, res) => {
    Post.findByPk(req.params.id)
    .then(dbPostData => {
        if (dbPostData) {
            const post = dbPostData.get({ plain: true });
          
            res.render("edit-post", {
                layout: "dashboard",
                post
            });
        } else {
            res.status(404).end();
        }
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

// CREATE USER COMMENTS
router.post("/", withAuth, (req, res) => {
    Comment.create({ ...req.body, userId: req.session.userId })
    .then(newComment => {
        res.json(newComment);
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

// LOGIN PAGE
router.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
        return;
    }
  
    res.render("login");
});

// SIGNUP PAGE
router.get("/signup", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/");
        return;
    }
  
    res.render("signup");
  });

module.exports = router;