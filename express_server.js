const express = require("express");
var cookieParser = require('cookie-parser')
const { put } = require("request");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
  let shortUrl = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= 6; i++) {
    shortUrl += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortUrl;
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }),cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls/new", (req, res) => {
  const templateVars = {username : req.cookies["username"]};
  res.render("urls_new");

});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username : req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  const templateVars = {urls: urlDatabase, username : req.cookies["username"]};
  console.log(req.body, shortUrl); // Log the POST request body to the console
  urlDatabase[shortUrl] = req.body.longURL,
  // res.send(`Ok, here is your short URL : ${Object.entries(urlDatabase)}`); // Respond with 'Ok' (we will replace this)

  res.redirect(`/urls`);
  
});

// app.post("/urls", (req, res) => {
//   let shortUrl = generateRandomString();
//   console.log(req.body, shortUrl); // Log the POST request body to the console
//   urlDatabase[shortUrl] = req.body.longURL,
//   // res.send(`Ok, here is your short URL : ${Object.entries(urlDatabase)}`); // Respond with 'Ok' (we will replace this)

//   res.redirect(`/urls`);
  
// });

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username : req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.params);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {

  console.log(req.params);
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});



app.get("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username : req.cookies["username"] };
  res.render("urls_show", templateVars);
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");

})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});