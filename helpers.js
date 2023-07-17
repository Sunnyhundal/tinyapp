const urlsForUser = (id, urlDatabase) => {
  const usersURLData = {};
  
  for (let shortURLS in urlDatabase) {
    if (urlDatabase[shortURLS].user === id) {
      usersURLData[shortURLS] = urlDatabase[shortURLS];

    }
  }
  return usersURLData;
};

const getUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return undefined;
};

const generateRandomString = function()  {
  let shortUrl = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    shortUrl += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return shortUrl;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };