const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/mahasiswa', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})