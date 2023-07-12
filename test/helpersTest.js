const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');
const { generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


describe('getUserByEmail', function() {
  it('Return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('Return null if email is not in database', function() {
    const user = getUserByEmail("notareaemail@test.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });

  it('Return undefined if email is empty', function() {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  }
  );
});

describe('generateRandomString', function() {
  it('Return a string with 6 characters', function() {
    const shortUrl = generateRandomString();
    const expectedLength = 6;
    assert.equal(shortUrl.length, expectedLength);
  });
}
);
