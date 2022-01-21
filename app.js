const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/passGenDB');
const passSchema = new mongoose.Schema({
  email: String,
  pass: String,
  app: String
});
const Password = mongoose.model('Password', passSchema);

const loginDetails = {
  id: 'testlogin',
  key: 'testpass'
};
let session = {
  id: "",
  key: ""
};
var password;

function genPass() {
  const passArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const tempPassword = [];
  for (var i = 0; i < 12; i++) {
    tempPassword.push(passArr.charAt(Math.floor(Math.random() * passArr.length)));
  }
  password = tempPassword.toString().replace(/,/g, "");
}


function logout() {
  session.id = '';
  session.key = '';
  location.replace('localhost:3000');
}


app.get("/", function(req, res) {
  res.render("index", {
    password: "Password",
    email: "Email"
  })
});
app.post('/', function(req, res) {
  if (req.body.uPass1 && req.body.uPass2) {
    if (req.body.uPass1 === req.body.uPass2) {
      const newPass = new Password({
        pass: req.body.uPass1,
        email: req.body.email,
        app: req.body.app
      });
      newPass.save();
      res.render('passGen', {
        password: req.body.uPass1,
        email: req.body.email,
        app: req.body.app
      });
    } else {
      console.log("failed to add password to Database : password didn't match.")
      res.redirect('/')
    }
  } else {
    genPass();
    const newPass = new Password({
      pass: password,
      email: req.body.email,
      app: req.body.app
    });
    newPass.save();
    res.render('passGen', {
      password: password,
      email: req.body.email,
      app: req.body.app
    });
  }


});



app.get('/pass', function(req, res) {
  if (session.id == loginDetails.id && session.key == loginDetails.key) {
    let data;
    Password.find({}, function(err, foundItems) {
      data = foundItems;
      res.render('pass', {
        data: foundItems
      });
    });
  } else {

    res.redirect('/login');
  }
});




app.get('/login', function(req, res) {
  res.render("login");
});
app.post('/login', function(req, res) {
  console.log(req.body.uniqId, req.body.loginKey);
  if (req.body.uniqId === loginDetails.id && req.body.loginKey === loginDetails.key) {
    session.id = req.body.uniqId;
    session.key = req.body.loginKey;
    res.redirect("/pass");
  } else {
    res.redirect('/login')
    console.log("failed : " + req.body.uniqId, req.body.loginKey)
  }
});




app.listen('3000', function() {
  console.log('SERVER IS UP AND RUNNING AT PORT : 3000')
});
