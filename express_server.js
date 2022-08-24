const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const figlet = require("figlet");
const PORT = 8080;


app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cookieSession({
  name: 'session',
  keys: ['I believe this will use key at 0, then allow for rotation']
}));

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID :{
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
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
  const id = req.session.user_id;
  if (!users[id]) {
    return res.redirect("/urls_redirect");
  }
  const url = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: url,
    users: users[req.session.user_id],
  };

  console.log(users, urlDatabase, req.session.user_id);

  res.render("urls_index", templateVars);
});

//sends user to a page that will explicitly tell the users they must login or register
app.get("/urls_redirect", (req, res) => {
  res.render("urls_redirect",);
});

//send user to the create new page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users[req.session.user_id],
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
  const id = req.session.user_id;
  if (!users[id]) {
    res.status(401);
    return res.send('<html><body>You are not logged in, you do not have permission to continue. <a href="/login">Please Login</a></body></html>');
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    return res.send('<html><body>This shortURL does not exist. <a href="/urls">Please Return home.</a></body></html>');
  }

  //if a user is logged in, but the id doesn't match the set cookie then the user doesn't have permission to access the url
  //TODO same as above TODO ^^
  if (urlDatabase[req.params.id].userID !== id) {
    res.status(401);
    return res.send('<html><body>You are not the owner of this tinyURL, you do not have permission to continue.</body></html>');
  }



  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    users: users[id],
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
    users: users[req.session.user_id],
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
    users: users[req.session.user_id],
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
  const id = req.session.user_id;
  if (!users[id]) {
    res.status(401);
    return res.send('<html><body>You are not registered and do not have permission to modify urls.</body></html>');
  }
  const tiny = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[id].id;
  urlDatabase[tiny] = { longURL, userID };
  res.redirect('/urls/' + tiny);
  
});

//add a post method that will allow updating of the long url
app.post("/urls/:id", (req, res) => {
  //if user is not logged in, error
  const id = req.session.user_id;
  if (!users[id]) {
    res.status(401);
    return res.send('<html><body>You are not logged in, you do not have permission to continue. <a href="/login">Please Login</a></body></html>');
  } else if (!urlDatabase[req.params.id]) {
    //if id doesn't exist, error, assume id of the short URL, for cURL requests
    res.status(404);
    return res.send('<html><body>That tinyURL does not exist<a href="/urls">Please return home</a></body></html>');
  } else if (urlDatabase[req.params.id].userID !== id) {
  //if user that is logged in but isn't the owner of the tinyURL cannot edit
    res.status(401);
    return res.send('<html><body>You are not the owner of this tinyURL, you do not have permission to continue.</body></html>');
  } else {
    const longURL = req.body.longURL;
    const userID = users[id].id;
    urlDatabase[req.params.id] = { longURL, userID };
    return res.redirect('/urls');
  }
});

//once user submits the form by hitting delete on the urls index page, that item is immediately deleted and redirected to home page
//TODO add a confirmation window before delete, possibly undo??
app.post("/urls/:id/delete", (req, res) => {
  //if user is not logged in, error
  const id = req.session.user_id;
  if (!users[id]) {
    res.status(401);
    return res.send('<html><body>You are not logged in, you do not have permission to continue. <a href="/login">Please Login</a></body></html>');
  } else if (!urlDatabase[req.params.id]) {
    //if id doesn't exist, error assume id of the short URL, for cURL requests
    res.status(404);
    return res.send('<html><body>That tinyURL does not exist<a href="/urls">Please return home</a></body></html>');
  } else if (urlDatabase[req.params.id].userID !== id) {
    //if user doesn't own that url, error
    res.status(401);
    return res.send('<html><body>You are not the owner of this tinyURL, you do not have permission to continue.</body></html>');
  } else {

    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  
  }
});

//when a user logs in we authenticate the user before logging that user
app.post("/login", (req, res) => {
  const { password, email } = req.body;
  const uId = getUserByEmail(email, users);
  
  if (email === "" || password === "") {
    return res.status(400);
  }
  
  //if the email search returns a empty object, that means user was not found
  if (!uId) {
    res.statusCode = 403;
    res.send(`${res.statusCode} The email you entered is not in our database Please go back and try again, or register a A New User.`);
  } else {
    //must also check if the hashed passwords match
    if (!bcrypt.compareSync(password, uId.password)) {
      res.statusCode = 403;
      return res.send(`${res.statusCode} The password you entered is incorrect`);
    }
  }

  //set cookie to that users id
  req.session.user_id = uId.id;
  res.redirect("/urls");

});


//set up the logout route so the user can hit the logout button and get redirected back to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//register end point
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  
  //if email or password are empty strings send back a 400 status code
  
  if (email === "" || password === "") {
    return res.status(400);
  }
  
  if (getUserByEmail(email, users)) {
    res.statusCode = 400;
    return res.send(`Error. Status code: ${res.statusCode} Account already exists`);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  };

  req.session.user_id = users[id].id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

