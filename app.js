const express = require("express")
const expressLayouts = require('express-ejs-layouts')
const morgan = require('morgan')

const {
  body,
  check,
  validationResult
} = require('express-validator');


const {
  getData,
  detailData,
  addData,
  deleteData,
  updateData,
  duplicateCheck
} = require('./utils/contacts')


const app = express()
const port = 3000


// Session utilities
const session = require('express-session')
const cookie = require('cookie-parser')
const flash = require('connect-flash')



app.set('view engine', 'ejs')
app.set('layout', 'layouts/main-layouts')


// Third-praty middleware
app.use(expressLayouts)
app.use(morgan('dev'))

app.use(session({
  resave: true,
  secret: 'secret',
  saveUninitialized: true,
  cookie: {
    maxAge: 6000
  }
}))

app.use(cookie('secret'))
app.use(flash())


// Built-in middleware
app.use(express.static('public'))
app.use(express.urlencoded({
  extended: true
}))


app.get("/", (req, res) => {
  res.render('index', {
    title: 'Home',
    layout: 'layouts/main-layouts'
  })
})

app.get("/about", (req, res) => {
  res.render('about', {
    title: 'About'
  })

})


app.get("/contact", (req, res) => {
  res.render('contact', {
    title: 'Contact',
    contacts: getData(),
    notif: req.flash('notif')
  })

})

app.get("/detail/:name", (req, res) => {
  res.render('detail', {
    title: 'Contact Detail',
    contact: detailData(req.params.name)
  })

})


app.get("/contact/add", (req, res) => {
  res.render('insert', {
    title: 'Add Contact',
  })
})

app.get("/edit/:name", (req, res) => {

  res.render('edit', {
    title: 'Edit Contact',
    contact: detailData(req.params.name)
  })
})


//  Add Contact
app.post("/contact", [
    body('name').custom((value) => {
      const result = duplicateCheck(value)
      console.log(result)
      if (result) {
        throw new Error('Name has been registered')
      }

      return true
    }),
    check('email', 'Invalid Email format').isEmail(),
    check('phone', 'Invalid Indonesian phone number format').isMobilePhone('id-ID')
  ],
  (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('insert', {
        title: 'Add Contact',
        errors: errors.array()
      })
    } else {
      addData(req.body)
      req.flash('notif', 'Contact added successfully...')
      res.redirect('contact')
    }
  })


//  update Contact
app.post("/update", [
    body('name').custom((value, {
      req
    }) => {
      const result = duplicateCheck(value)

      if (req.body.oldName !== value && result) {
        throw new Error('Name has been registered')
      }

      return true
    }),
    check('email', 'Invalid Email format').isEmail(),
    check('phone', 'Invalid Indonesian phone number format').isMobilePhone('id-ID')
  ],
  (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('edit', {
        title: 'Edit Contact',
        errors: errors.array(),
        contact: req.body
      })
    } else {
      updateData(req.body)
      req.flash('notif', 'Contact updated successfully...')
      res.redirect('contact')
    }
  })



app.get("/delete/:name", (req, res) => {

  deleteData(req.params.name)
  req.flash('notif', 'Contact deleted successfully...')

  res.redirect('/contact')
})


app.use('/', (req, res) => {
  res.status(404)
  res.send('<h2>404 page not found</h1>')
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})