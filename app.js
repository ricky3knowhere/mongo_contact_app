const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const methodOverride = require("method-override");

const { body, check, validationResult } = require("express-validator");

// Connect to database
require("./utils/db");
const { Contact } = require("./models/contact");

const app = express();
const port = 3000;

// Session utilities
const session = require("express-session");
const cookie = require("cookie-parser");
const flash = require("connect-flash");

app.set("view engine", "ejs");
app.set("layout", "layouts/main-layouts");

// Third-praty middleware
app.use(methodOverride("_method"));
app.use(expressLayouts);
app.use(morgan("dev"));

app.use(
  session({
    resave: true,
    secret: "secret",
    saveUninitialized: true,
    cookie: {
      maxAge: 6000,
    },
  })
);

app.use(cookie("secret"));
app.use(flash());

// Built-in middleware
app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    layout: "layouts/main-layouts",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
  });
});

app.get("/contact", async (req, res) => {
  res.render("contact", {
    title: "Contact",
    contacts: await Contact.find(),
    notif: req.flash("notif"),
  });
});

app.get("/detail/:id", async (req, res) => {
  res.render("detail", {
    title: "Contact Detail",
    contact: await Contact.findOne({
      _id: req.params.id,
    }),
  });
});

app.get("/contact/add", (req, res) => {
  res.render("insert", {
    title: "Add Contact",
  });
});

app.get("/edit/:id", async (req, res) => {
  res.render("edit", {
    title: "Edit Contact",
    contact: await Contact.findOne({
      _id: req.params.id,
    }),
  });
});

//  Add Contact
app.post(
  "/contact",
  [
    body("name").custom(async (value) => {
      const result = await Contact.findOne({
        name: value,
      });
      console.log(result);
      if (result) {
        throw new Error("Name has been registered");
      }

      return true;
    }),
    check("email", "Invalid Email format").isEmail(),
    check("phone", "Invalid Indonesian phone number format").isMobilePhone(
      "id-ID"
    ),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("insert", {
        title: "Add Contact",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (err) => {
        req.flash("notif", "Contact added successfully...");
        res.redirect("contact");
      });
    }
  }
);

//  update Contact
// app.post("/update", [
//     body('name').custom(async (value, {
//       req
//     }) => {
//       const result = await Contact.findOne({
//         name: value
//       })

//       if (req.body.oldName !== value && result) {
//         throw new Error('Name has been registered')
//       }

//       return true
//     }),
//     check('email', 'Invalid Email format').isEmail(),
//     check('phone', 'Invalid Indonesian phone number format').isMobilePhone('id-ID')
//   ],
//   async (req, res) => {
//     const errors = validationResult(req)

//     if (!errors.isEmpty()) {
//       res.render('edit', {
//         title: 'Edit Contact',
//         errors: errors.array(),
//         contact: req.body
//       })
//     } else {

//       await Contact.updateOne(req.body)
//       req.flash('notif', 'Contact updated successfully...')
//       res.redirect('contact')
//     }
//   })

//  update Contact
app.put(
  "/contact",
  [
    body("name").custom(async (value, { req }) => {
      const result = await Contact.findOne({
        name: value,
      });

      if (req.body.oldName !== value && result) {
        throw new Error("Name has been registered");
      }

      return true;
    }),
    check("email", "Invalid Email format").isEmail(),
    check("phone", "Invalid Indonesian phone number format").isMobilePhone(
      "id-ID"
    ),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("edit", {
        title: "Edit Contact",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      // res.send(req.body)
      console.log(req.body);
      Contact.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
          },
        }
      ).then((log) => {
        req.flash("notif", "Contact updated successfully...");
        res.redirect("/contact");
      });
    }
  }
);

// app.get("/delete/:name", async (req, res) => {

//   const contact = await Contact.findOne({
//     name: req.params.name
//   })

//   Contact.deleteOne({_id: contact._id }, (err) => {

//     req.flash('notif', 'Contact deleted successfully...')
//     res.redirect('/contact')
//   })
// })
app.delete("/contact", (req, res) => {
  Contact.deleteOne({
    _id: req.body.id,
  }).then((err) => {
    req.flash("notif", "Contact deleted successfully...");
    res.redirect("/contact");
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h2>404 page not found</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
