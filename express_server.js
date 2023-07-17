// imports and requires for the server to run properly and to access the helper functions.
const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");




const app = express();
const PORT = 8080; // default port 8080

//saltrounds for bcrypt to hash the password
const saltRounds = 10;
//gensaltSync for bcrypt to generate a salt
const salt = bcrypt.genSaltSync(saltRounds);

app.use(express.urlencoded({ extended: true }), cookieSession({name: "session",
  keys: [generateRandomString()], maxAge: 24 * 60 * 60 * 1000 // cookie expires after 24 hours
}), morgan("dev"));

app.set("view engine", "ejs");

// Test database of URLs as an object since we are not using a database yet.
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





// Root page redirect to login page.
app.get("/", (req, res) => {
  
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


// Renders the main page with the shortURL and longURL of the user. If user is not logged in, they are redirected to the login page.
app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  const visibleURL = urlsForUser(req.session.user_id, urlDatabase);
  if (!user) {
    res.redirect(401, "/login");
  } else {
    const templateVars = {
      urls: visibleURL,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});
// handles the creation of a new URL. If user is not logged in, they are asked to login. If user is logged in, they are redirected to the new URL page.
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.status(401).send("Please login to create a new URL");
  } else {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {
      urls: req.body.longURL,
      user: users[req.session.user_id].id
    };
    urlDatabase[shortUrl].longURL = req.body.longURL;
    res.redirect(`/urls/${shortUrl}`);
  }
});

// Renders page for new URL creation. If user is not logged in, they are redirected to the login page.
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[user] };
    res.render("urls_new", templateVars);
  }
});

// Routing for registration: If user is not logged in, they can register. If they are logged in, they are redirected to the urls page.
app.get("/register", (req, res) => {
  const user = req.session.user_id;
  
  if (!user) {
    const templateVars = { user: users[user] };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }

});

// Registration post logic to add new user to the users database. If the email or password is empty, the user will be redirected to an error page. If the email already exists, the user will be redirected to an error page.
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, salt);

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
      password: hashedPassword,
    };
    req.session.user_id = userId;
    res.redirect("/urls");
  }

});
//Shows page with shortURL and longURL and edit option.
app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  if (urlDatabase[req.params.id]) {
    if (urlDatabase[req.params.id].user === user) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: users[req.session.user_id],
      };
      res.render("urls_show", templateVars);
    } else if (!user) {
      res.status(401).send("Only registered users can edit their URLs");
    } else if (urlDatabase[req.params.id].user !== user) {
      res.status(401).send("You can only edit your own URLs");
    }
  } else {
    res.status(404).send("Whoops! you have entered an invalid link.");
  }
});

app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  if (urlDatabase[req.params.id]) {
    if (urlDatabase[req.params.id].user === user) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect(`/urls`);
    } else if (!user) {
      res.status(401).send("Only registered users can edit their URLs");
    } else if (urlDatabase[req.params.id].user !== user) {
      res.status(401).send("You can only edit your own URLs");
    }
  } else {
    res.status(404).send("Whoops! you have entered an invalid link.");
  }
});



// URL update post logic to update the URL in the database.
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});
// URL delete post logic to delete the URL from the database.
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  if (urlDatabase[req.params.id]) {
    if (urlDatabase[req.params.id].user === user) {
      delete urlDatabase[req.params.id];
      res.redirect(`/urls`);
    } else {
      res.status(401).send("Sorry, only registered users can edit their URLs");
    }
  } else {
    res.status(404).send("Whoops! You have entered an invalid link.");
  }
  
});

// Routing for shortURLs: If the shortURL does not exist, the user will be redirected to an error page. If the shortURL exists, the user will be redirected to the longURL.
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("Whoops! you have entered an invalid link.");
  }
  
});

// Routing for login: If the user is not logged in, they will be redirected to the login page. If the user is logged in, they will be redirected to the urls page.
app.get("/login", (req, res) => {
  const user = req.session.user_id;

  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[user]};
    res.render("login", templateVars);
  }

});

// Login post logic to check if the user exists in the database. If the user does not exist, they will be redirected to an error page. Checks if valid users email and password match. If the password does not match, the user will be redirected to an error page.
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userId;
 
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("User not found");
  } else {
    const user = getUserByEmail(email, users);
    userId = user.id;
    const passwordCheck = bcrypt.compareSync(password, user.password);
    if (!passwordCheck) {
      res.status(403).send("Incorrect password!");
    }
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});
// Logout post logic to clear the cookie and redirect the user to the login page.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
