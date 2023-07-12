const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { getUserByEmail } = require("./helper");
const { generateRandomString } = require("./helper");
const { put } = require("request");

const app = express();
const PORT = 8080; // default port 8080
app.use(express.urlencoded({ extended: true }), cookieParser(), morgan("dev"));

app.set("view engine", "ejs");
// Test database of URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// Test database of users as an object since we are not using a database yet.
let users = {
  userRandomID: {
    id: "ada34ewfsw",
    email: "abc@123.com",
    password: "123",
  },
};
// root path
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const user = req.cookies.user_id;
  if (!user) {
    res.redirect(401, "/login");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const user = req.cookies.user_id;
  if (!user) {
    res.redirect(401, "/login");
  } else {
    console.log(req.body);
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {
      urls: req.body.longURL,
      user: user
    };
    urlDatabase[shortUrl].longURL = req.body.longURL;
    res.redirect(`/urls/${shortUrl}`);
  }
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies.user_id;
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[user] };
    res.render("urls_new", templateVars);
  }
});


app.get("/register", (req, res) => {
  const user = req.cookies.user_id
  
if (!user) {
  const templateVars = { user: users[user] };
  res.render("register", templateVars);
} else {
  res.redirect("/urls");
}

});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userId = generateRandomString();

  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send(`User with email ${email} already exists`);
  } else if (password.length === 0) {
    return res.status(400).send(`Please enter a valid password`);
  } else if (email.length === 0) {
    return res.status(400).send(`Please enter a valid email`);
  } else {
    users[userId] = {
      id: userId,
      email: email,
      password: password,
    };
    res.cookie("user_id", userId);
    res.redirect("/urls");
  }

  console.log(users[userId]);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id]
  };
  console.log("console:", templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.params);
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
if (urlDatabase[req.params.id].longURL) {
  res.redirect(urlDatabase[req.params.id].longURL);
} else {
  res.status(404).send("Whoops! you have entered an invalid link.");
}
  
});


app.get("/login", (req, res) => {
  const user = req.cookies.user_id;

  if (user) {
    res.redirect("/urls")
  } else {
    const templateVars = { user: users[user]};
    res.render("login", templateVars);
  }

});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userId;

  const templateVars = { user: users[req.cookies.user_id] };
  res.cookie("user_id", templateVars);

  if (!getUserByEmail(email, users)) {
    return res.status(403).send("User not found");
  } else {
    const user = getUserByEmail(email, users);
    userId = user.id;
    if (password !== user.password) {
      res.status(403).send("Incorrect password!");
    }
    res.cookie("user_id", userId);
    console.log("logging users: ",users);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
