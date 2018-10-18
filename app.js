const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', () => {
  console.log('Connected to Redis');
});

const port = 3000;

const app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(methodOverride('_method'));

// Search Page
app.get('/', (req, res, next) => {
  res.render('searchusers');
});

//Search Processing
app.post('/user/search', (req, res, next) => {
  let id = req.body.id;

  client.hgetall(id, (err, obj) => {
    if(!obj) {
      res.render('searchusers', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

// Add User Page
app.get('/user/add', (req, res, next) => {
  res.render('adduser');
});

// Process Add User Page
app.post('/user/add', (req, res, next) => {
  const { id, firstname, lastname, email, phone} = req.body;

  client.hmset(id, [
    'firstname', firstname,
    'lastname', lastname,
    'email', email,
    'phone', phone
  ], (err, reply) => {
    if (err) {
        console.error(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});

// Delete User
app.delete('/user/delete/:id', (req, res, next) => {
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
