const crypto = require("crypto");


//function that employs crypto to help generate random (length) character string
const generateRandomString = (length) => {
  // generate a random hex number with the crypto module see Node docs
  const id = crypto.randomBytes(3).toString('hex');
  let result = "";
  for (let i = 0; i < length; i ++) {
  //Loop through that number and replace certain characters (at a random index each time)
    const randomNum = Math.floor((Math.random() * (length - 1)) + 1);
    if (id.charAt(randomNum).search(/[a-z]/g) === 0) {
      result += id[randomNum].toUpperCase();
    } else if (id.charAt(randomNum).search(/[a-z]/g) === -1) {
      result += (Math.random() + 1).toString(36).substring(2, 3); //uses base 36 to return a single randomize character as long as the character is a not lowercase, this is needed as hex only includes up to base 16, letter F
    } else {
      result += id[i];
    }

  }
  return result;
};

const getUserByEmail = (email, users) => {
  for (const uId in users) {
    if (users[uId].email === email) {
      return users[uId];
    }
  }
  
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = {longURL: urlDatabase[shortURL].longURL };
    }
  }

  return urls;
};



module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
};