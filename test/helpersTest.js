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
    const result = generateRandomString(6);
    assert.equal(result.length, 6);
  });

  it('should not have two strings equal after just 2 calls', () => {
    const idOne = generateRandomString(6);
    const idTwo = generateRandomString(6);
    assert.notEqual(idOne, idTwo);
  });

  //there is a chance that this could fail, especially if you increased the amount of loops, there is probably a better way to generate a more 'randomness' into the function
  //edit: I allowed a number to be passed which will dictate the length of the string generated, this should increase the chance of the string not being equal
  it('Should not have any strings equal after many calls', () => {
    for (let i = 0; i < 10000; i++) {
      const idOne = generateRandomString(6);
      const idTwo = generateRandomString(6);
      assert.notEqual(idOne, idTwo);
    }
  });

  it('Should not have any strings equal after many calls for a string with a length of (32)', (done) => {
    for (let i = 0; i < 50000; i++) {
      const idOne = generateRandomString(32);
      const idTwo = generateRandomString(32);
      assert.notEqual(idOne, idTwo);

    }
    done();

  });
});

describe('#urlsForUser', () => {
  it('should return a object', () => {
    const type = urlsForUser("aJ48lW", testDatabase);
    assert.equal(typeof type, "object");
  });

  it('should return a empty object when no user exists', () => {
    assert.deepEqual(urlsForUser("bob", testDatabase), {});
  });

  it('should return an object in the proper format when a user is found', () => {
    const actual = urlsForUser("aJ48lW", testDatabase);
    const expected =  {
      "9sm5xK": {
        "longURL": "http://www.google.com"
      },
      "b2xVn2": {
        "longURL": "http://www.lighthouselabs.ca"
      }
    };


    assert.deepEqual(actual, expected);
  });
});