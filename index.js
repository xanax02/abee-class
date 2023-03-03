const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));



const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root', /* MySQL User */
  password: '', /* MySQL Password */
  database: 'node_restapi' /* MySQL Database */
});



conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected with App...');
});
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// app.get("/",function(request,response){
//   if (request.session.loggedin) {
//   // Output username
//   response.send('Welcome back, ' + request.session.username + '!');
// } else {
//   // Not logged in
//   response.send('Please login to view this page!');
// }
// response.end()
// });
app.get("/",function(req,res){
  res.render("login")
});
app.post('/auth', function(req, res) {
	let username = req.body.user;
	let password = req.body.pass;
	if (username && password) {
		conn.query('SELECT * FROM userAuth WHERE username = ? AND passwd = ?', [username, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				req.session.loggedin = true;
        req.session.username = username;
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
    res.end();
	}
});


app.post('/create',(req, res) => {

  let data = {title: req.body.title, body: req.body.body, createdUser: req.session.username};


  let sqlQuery = "INSERT INTO items SET ?";

  let query = conn.query(sqlQuery, data,(err, results) => {
    if(err) throw err;
    else {
      res.redirect("/home");
    }
  });
});



app.get('/api/items',(req, res) => {
  let sqlQuery = "SELECT * FROM items";

  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
    res.send(apiResponse(results));
  });
});
app.get("/create",function(req,res){
  if (req.session.loggedin) {
  res.render("create");
}
else {
  res.redirect("/");
}
});


app.get('/api/items/:id',(req, res) => {
  let sqlQuery = "SELECT * FROM items WHERE id=" + req.params.id+ " LIMIT 1";

  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
    res.render("show", {results})
  });
});

app.get('/api/del/:id',(req, res) => {
  let sqlQuery = "DELETE FROM items WHERE id="+req.params.id;

  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
      res.redirect("/home");
  });
});



function apiResponse(results){
    return JSON.stringify({"status": 200, "error": null, "response": results});
}
app.get("/home",function(req,res){
if (req.session.loggedin){
  let sqlQuery = "SELECT * FROM items";

  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
    res.render("home",{results});

  });}
  else {
    res.redirect("/");
  }
});
app.get("/find",function(req,res){
if (req.session.loggedin){
  let sqlQuery = "SELECT * FROM items where createdUser='"+req.session.username+"'";

  let query = conn.query(sqlQuery, (err, results) => {
    if(err) throw err;
    res.render("homes",{results});

  });}
  else {
    res.redirect("/");
  }
});

app.listen(3000,() =>{
  console.log('Server started on port 3000...');
});
