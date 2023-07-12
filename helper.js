const urlsForUser = (id, database) => {
  const usersURLData = {};
  
for (let shortURLS in database) {
if (database[shortURLS].userID === id) {
  usersURLData[shortURLS] === database[shortURLS];
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
  return null;
};

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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };