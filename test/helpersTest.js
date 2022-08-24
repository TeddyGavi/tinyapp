const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

const testBadStructure = {
  id: "user2",
  email: "user2@bob.com",
  password: "notAGoodOne",
};

const testEmpty = {};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });

  it('should return null if the email does not exist', () => {
    const user = getUserByEmail("abddadf", testUsers);
    assert.equal(user, null);
  });

  it('should return null if the entered database does not match the structure', () => {
    const user = getUserByEmail("user2@bob.com", testBadStructure);
    assert.equal(user, null);
  });

  it('should return null if empty database is provided', () => {
    assert.equal(getUserByEmail("at@at.com", testEmpty), null);
  });


  it('should return null if no arguments are passed', () => {
    assert.equal(getUserByEmail(), null);
  });

});
