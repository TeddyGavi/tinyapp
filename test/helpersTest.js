const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

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

const testDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

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


describe('#generateRandomString', () => {
  it('Should return a string of 6 characters', () => {
    const result = generateRandomString()
    assert.equal(result.length, 6);
  })

  it('should not have two strings equal after just 2 calls', () => {
    const idOne = generateRandomString();
    const idTwo = generateRandomString();
    assert.notEqual(idOne, idTwo)
  })

  //there is a chance that this could fail, especially if you increased the amount of loops, there is probably a better way to generate a more 'randomness' into the function
  it('Should not have any strings equal after many calls', () => {
    for (let i = 0; i < 10000; i++){
      const idOne = generateRandomString()
      const idTwo = generateRandomString()
      assert.notEqual(idOne, idTwo);
    }
  })
})

describe('#urlsForUser', () => {
  it('should return a object', () => {
    assert.equal
  })
})