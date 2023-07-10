const express = require("express");
var cookieParser = require("cookie-parser");
const crypto = require("crypto");
const morgan = require("morgan");
const { getUserByEmail } = require("./helper");
const { put } = require("request");
const e = require("express");

const app = express();
const PORT = 8080; // default port 8080
app.use(express.urlencoded({ extended: true }), cookieParser(), morgan("dev"));

app.set("view engine", "ejs");

function generateRandomString() {
  let shortUrl = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= 6; i++) {
    shortUrl += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return shortUrl;
}

let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const randomBytes = crypto.randomBytes(32);
  const randomString = randomBytes.toString("hex");
  let userId = randomString;

  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send(`User with email ${email} already exists`);
  }
  else if (password.length === 0) {
    return res.status(400).send(`Please enter a valid password`);
  }
  else if (email.length === 0) {
    return res.status(400).send(`Please enter a valid email`);
  }else{
    
    users[userId] = {
      id: userId,
      email,
      password
    };
    res.cookie("user_id", userId);
    res.redirect('/urls');

  }

  console.log(users[userId]);

});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  const templateVars = { urls: urlDatabase,  user: users[req.cookies.user_id]};
  console.log(req.body, shortUrl); // Log the POST request body to the console
  (urlDatabase[shortUrl] = req.body.longURL),
    // res.send(`Ok, here is your short URL : ${Object.entries(urlDatabase)}`); // Respond with 'Ok' (we will replace this)

    res.redirect(`/urls`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: { user: users[req.cookies.user_id]},
  };
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
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
  res.redirect(urlDatabase[req.params.id]);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id]};
  res.render("urls_new");
});


// app.post("/urls", (req, res) => {
//   let shortUrl = generateRandomString();
//   console.log(req.body, shortUrl); // Log the POST request body to the console
//   urlDatabase[shortUrl] = req.body.longURL,
//   // res.send(`Ok, here is your short URL : ${Object.entries(urlDatabase)}`); // Respond with 'Ok' (we will replace this)

//   res.redirect(`/urls`);

// });









app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  const username = { user: users[req.cookies.user_id]};
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = { user: users[req.cookies.user_id]};
  res.clearCookie("user", username);
  res.redirect("/urls");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
