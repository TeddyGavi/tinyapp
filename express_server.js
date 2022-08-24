const express = require("express");
const app = express();
const crypto = require("crypto");
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const figlet = require("figlet");
const PORT = 8080;


app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cookieParser());

figlet.text('Welcome to\nTiny App', {
  font: "Avatar",
  horizontalLayout: 'fitted',
  verticalLayout: "fitted",
  whitespaceBreak: true,

}, (err, data) => {
  if (err) {
    console.log(err.message);
  }
  console.log(data);
});

//a function using crypto to help generate random 6 character string
const generateRandomString = () => {
  // generate a random hex number with the crypto module see Node docs
  const id = crypto.randomBytes(3).toString('hex');
  let result = "";
  for (let i = 0; i < 6; i ++) {
  //Loop through that number and replace certain characters (at a random index each time)
    const randomNum = Math.floor((Math.random() * 5) + 1);
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

const getUserByEmail = (email) => {
  for (const uId in users) {
    if (users[uId].email === email) {
      return users[uId];
    }
  }
  
  return null;
};

const urlsForUser = (id) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = {longURL: urlDatabase[shortURL].longURL };
    }
  }

  return urls;
};

const urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID :{
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};


/*************************** TESTs *********************************/
//root directory redirects to urls index will change later
app.get("/", (req, res) => {
  res.redirect("/register");
});
//viewing the json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//testing html output
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/*************************** TESTs END ******************************/

/*************************** GET start ******************************/


//main page,
app.get("/urls", (req, res) => {
  if (!users[req.cookies.user_id]) {
    return res.redirect("/urls_redirect");
  }
  const id = req.cookies.user_id;
  const url = urlsForUser(id);
  const templateVars = {
    urls: url,
    users: users[req.cookies.user_id],
  };

  // console.log('The logged in user is', users[req.cookies.user_id]);
  res.render("urls_index", templateVars);
});

//sends user to a page that will explicitly tell the users they must login or register
app.get("/urls_redirect", (req, res) => {
  res.render("urls_redirect",);
});


//send user to the create new page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users[req.cookies.user_id],
  };

  if (!templateVars.users) {
    return res.redirect("/urls_redirect");
  }

  // console.log('The logged in user is', users[req.cookies.user_id]);
  res.render("urls_new", templateVars);
  
});



//this will send the appropriate object to the show page in order to be displayed after form submission
app.get("/urls/:id", (req, res) => {
//if a user is not logged in, display relevant message
//TODO redirect to "urls_redirect" after a modal message
  if (!users[req.cookies.user_id]) {
    res.status(401);
    return res.send('<html><body>You are not logged in, you do not have permission to continue. <a href="/login">Please Login</a></body></html>');
  }

  //if a user is logged in, but the id doesn't match the set cookie then the user doesn't have permission to access the url
  //TODO same as above TODO ^^
  const id = req.cookies.user_id;
  console.log(id);
  console.log(urlDatabase[req.params.id].userID);
  if (urlDatabase[req.params.id].userID !== id) {
    res.status(401);
    return res.send('<html><body>You are not the owner of this tinyURL, you do not have permission to continue.</body></html>');
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    users: users[req.cookies.user_id],
  };
  // console.log('The logged in user is', users[req.cookies.user_id]);
  res.render("urls_show", templateVars);
});


//redirect any short url to the longurl
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send('<html><body>This shortened URL does not exist.</body></html>');
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//register page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users[req.cookies.user_id],
  };
  if (templateVars.users) {
    // console.log('The logged in user is', users[req.cookies.user_id]);
    return res.redirect("/urls");
  }
  // console.log(`No one is logged in`);
  res.render("urls_register", templateVars);
  
});

app.get("/login",(req, res) => {
  const templateVars = {
    users: users[req.cookies.user_id],
  };
  if (templateVars.users) {
    // console.log('The logged in user is', users[req.cookies.user_id]);
    return  res.redirect("/urls");
  }
  // console.log(`No one is logged in`);
  res.render("urls_login", templateVars);
  
});

/*************************** GET end **************************/


/**************************POST********************************/

//form submission handling by updating the database
app.post("/urls", (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.status(401);
    return res.send('<html><body>You are not registered and do not have permission to modify urls.</body></html>');
  }
  const tiny = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[req.cookies.user_id].id;
  urlDatabase[tiny] = { longURL, userID };
  res.redirect('/urls/' + tiny);
  
});

//add a post method that will allow updating of the long url
app.post("/urls/:id", (req, res) => {
  //if user that is logged in, matches the current cookie id, then we can allow for editing of the urls
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    res.status(401);
    return res.send('<html><body>You are not the owner of this tinyURL, you do not have permission to continue.</body></html>');
  } 

    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
  
});

//once user submits the form by hitting delete on the urls index page, that item is immediately deleted and redirected to home page
//TODO add a confirmation window before delete, possibly undo??
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//when a user logs in we authenticate the user before logging that user
app.post("/login", (req, res) => {
 
  const uId = getUserByEmail(req.body.email);

  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
  }
  
  //if the email search returns a empty object, that means user was not found
  //must also check if the passwords match
  if (uId === null) {
    res.statusCode = 403;
    res.send(`${res.statusCode} The email you entered is not in our database Please go back and try again, or register a A New User.`);
  } else {
    if (uId.password !== req.body.password) {
      res.statusCode = 403;
      return res.send(`${res.statusCode} The password you entered is incorrect`);
    }
  }

  //set cookie to that users id
  res.cookie("user_id", uId.id);
  res.redirect("/urls");

});


//set up the logout route so the user can hit the logout button and get redirected back to login page
app.post("/logout", (req, res) => {
  // console.log(users);
  res.clearCookie("user_id");
  res.redirect("/login");
});

//register end point
app.post("/register", (req, res) => {
  const id = generateRandomString();
  
  //if email or password are empty strings send back a 400 status code
  
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
  }
  
  // console.log(getUserByEmail(req.body.email));
  if (getUserByEmail(req.body.email)) {
    res.statusCode = 400;
    return res.send(`Error. Status code: ${res.statusCode} Account already exists`);
  }
  
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie("user_id", users[id].id);
  // console.log(JSON.stringify(users[req.cookies.user_id], null, 2));
  // console.log(users[req.cookies.user_id], users);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// module.exports = {users}