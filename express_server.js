const express = require("express");
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

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  console.log(req.body, shortUrl); // Log the POST request body to the console
  urlDatabase[shortUrl] = req.body.longURL,
  // res.send(`Ok, here is your short URL : ${Object.entries(urlDatabase)}`); // Respond with 'Ok' (we will replace this)

  res.redirect(`/urls`)
  
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  //res.render("urls_show", templateVars);
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});