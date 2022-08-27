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

//write a function that will help authenticate the user, specifically for put /urls/:id and delete /urls/:id/delete

//another function that will simply check if the user is logged in would be useful as well?

//returns a error code based auth procedures outline in compass.
const authorizeUser = (req, users, urlDatabase) => {
  const id = req.session.user_id;
  let error = '';
  if (!users[id]) {
    // res.status(401);
    // return res.redirect("/urls_redirect/_401");
    error = 401;
    
  } else if (!urlDatabase[req.params.id]) {
    //if shorturl doesn't exist, error, assume id of the short URL, for cURL requests
    // res.status(404);
    // return res.redirect("/urls_redirect/_404");
    error = 404;

  } else if (urlDatabase[req.params.id].userID !== id) {
  //if user that is logged in but isn't the owner of the tinyURL cannot edit
    // res.status(403);
    // return res.redirect("/urls_redirect/_403");
    error = 403;
  } else {
    return true;
  }

  return error;
  
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  authorizeUser,
};