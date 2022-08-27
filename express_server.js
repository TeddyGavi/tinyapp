const express = require("express");
const methodOverride = require("method-override");
const app = express();
const bcrypt = require('bcryptjs');
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser, authorizeUser } = require("./helpers");
const { PORT, SESSION_KEYS, ERROR } = require("./CONSTANTS");
const figlet = require("figlet");

app.use(methodOverride('_method'));

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: SESSION_KEYS,
  maxAge: 24 * 60 * 60 * 1000,
}));

// welcome message in the terminal, not needed but good learning experience
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

//example DBs for testing
//I spoke to Sarah Zsu and Ernie Johnson for help with these, and the array idea was brought up in lecture on Thursday Aug 25/2022 by Bryan Gomes
//user tracking is accomplished by creating an array of objects, this array contains the id of the visitor (which is set as the cookie, if the user is not registered in the database then a new random id is created, as well as logging the time the visit was created)
//total visits can then be achieved by getting the length of the array,
//right now I have the clicks being stored in a separate clickDB object, which simply increments whenever a visit to a site is recorded, a new object must also be created for every new URL made.
//unique visits can be achieved by filtering the array into an array of visitIDs and creating a new Set() object which will only be made of unique items
//we can then call the .size property to get the amount of unique visits
//this has the downside of creating a very large log file to be created, but the set is fast from what I have read?
//so far I have implemented this in the urls_show ejs
//TODO need to implement date display of each unique visit, as well as created date of URL

const urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
    date: "22/07/2022",
    clickHistory: [ {visitID: "98uY56", createdAt: new Date()}]
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
    date: "08/08/2022",
    clickHistory: [],
  },
};

//In actual practice I wouldn't store the passwords like this, as discussed in lecture we would need to create a .env file to store the passwords, in the database we are uploading only hashed passwords
//however in this example app it is nice to be able to copy and paste the passwords into the browser for easy testing
//It would be a good idea to keep the session keys in a separate .env file as well, here that is temporarily represented by using the CONSTANTS.js file

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

const clickDB = {
  "b2xVn2": {
    userID: "aJ48lW",
    click: 0,
  },
  "9sm5xK": {
    userID: "aJ48lW",
    click: 15,
  },
};


/*************************** TESTs and DEV use **********************/
//root directory redirects to register
app.get("/", (req, res) => {
  res.redirect("/register");
});
//viewing the json, handing for debugging
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/*************************** TESTs END ******************************/

/*************************** GET start ******************************/

//main page,
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  //the clickDB is only needed to display the stretch objectives see urls_index for more info
  if (!users[id]) {
    return res.redirect("/urls_redirect/_401");
  }
  const url = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: url,
    users: users[id],
    urlDB: urlDatabase,
    click: clickDB,
  };

  res.render("urls_index", templateVars);
});

//sends user to a ERROR page that will explicitly display an error popup as well as direction to register or login
app.get("/urls_redirect/:error", (req, res) => {
  const id = req.session.user_id;
  const url = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: url,
    users: users[id],
    errorMessage: ERROR[req.params.error],
    errorTitle: req.params.error
  };
  res.render("urls_redirect", templateVars);
});

//send user to the create new page
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    users: users[id],
  };

  if (!templateVars.users) {
    //not logged in
    res.status(401);
    return res.redirect("/urls_redirect/_401");
  }
  res.render("urls_new", templateVars);
});

//this will send the appropriate object to the show (edit) page in order to be displayed after form submission
app.get("/urls/:id", (req, res) => {
  const id = req.session.user_id;
  const tiny = req.params.id;
  const isUserAuth = authorizeUser(req, users, urlDatabase);

  if (typeof isUserAuth === "boolean") {
 
    const templateVars = {
      id: tiny,
      longURL: urlDatabase[tiny].longURL,
      users: users[id],
      dateCreated: urlDatabase[tiny].date,
      click: clickDB[tiny].click,
      urlDB: urlDatabase[tiny].clickHistory
    };

    return res.render("urls_show", templateVars);

  } else {
    res.status(isUserAuth);
    return res.redirect(`/urls_redirect/_${isUserAuth}`);
  }
});

//redirect any short url to the longurl
app.get("/u/:id", (req, res) => {
  const tiny = req.params.id;
  let trackId = req.session.user_id;
  if (!urlDatabase[tiny]) {
    return res.redirect("/urls_redirect/_404");
  }

  if (!trackId) {
    trackId = generateRandomString(16);
  }
  urlDatabase[tiny].clickHistory.push({ visitID: trackId, createdAt: new Date() });

  clickDB[tiny].click++;
  const longURL = urlDatabase[tiny].longURL;
  res.redirect(longURL);
});

//register page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users[req.session.user_id],
  };
  if (templateVars.users) {
    return res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/login",(req, res) => {
  const templateVars = {
    users: users[req.session.user_id],
  };
  if (templateVars.users) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

/*************************** GET end **************************/


/**************************POST********************************/

//form submission handling by updating the database
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  if (!users[id]) {
    res.status(401);
    return res.redirect("/urls_redirect/_401");
  }
  const tiny = generateRandomString(6);
  const longURL = req.body.longURL;
  const userID = users[id].id;
  const click = 0;
  const dateNow = new Date().toString();
  const clickHistory = [];

  //append DBs
  urlDatabase[tiny] = { longURL, userID, dateNow, clickHistory };
  clickDB[tiny] = { userID, click };

  res.redirect('/urls/' + tiny);
});

//add a post method, made RESTful that will allow updating of the long url
app.put("/urls/:id", (req, res) => {
  const id = req.session.user_id;
  const isUserAuth = authorizeUser(req, users, urlDatabase);

  if (typeof isUserAuth === "boolean") {
    const longURL = req.body.longURL;
    const tiny = req.params.id;
    const userID = users[id].id;
    const click = 0;
    const dateNow = new Date().toString();
    const clickHistory = [];

    //append DBs
    urlDatabase[tiny] = { longURL, userID, dateNow, clickHistory };
    clickDB[tiny] = { userID, click };
    return res.redirect('/urls');
  } else {
    res.status(isUserAuth);
    return res.redirect(`/urls_redirect/_ ${isUserAuth}`);
  }
});

//once user submits the form by confirming delete on the urls index page, that item is immediately deleted and redirected to home page
//THIS HAS BEEN OVERRIDDEN TO A DELETE
app.delete("/urls/:id/delete", (req, res) => {
  const isUserAuth = authorizeUser(req, users, urlDatabase);

  if (typeof isUserAuth === "boolean") {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else {
    res.status(isUserAuth);
    return res.redirect(`/urls_redirect/_ ${isUserAuth}`);
  }
});

//when a user logs in we authenticate the user before logging that user
app.post("/login", (req, res) => {
  const { password, email } = req.body;
  const userObj = getUserByEmail(email, users);
  
  if (email === "" || password === "") {
    //400 empty due to required attribute on the ejs form, you cannot continue unless you fill this form
    return res.status(400);
  }

  //if the email search returns a empty object, that means user was not found
  if (!userObj) {
    res.status(403);
    return res.redirect("/urls_redirect/_403LOGIN");
  } else {
    //must also check if the hashed passwords match
    if (!bcrypt.compareSync(password, userObj.password)) {
      res.status(403);
      return res.redirect("/urls_redirect/_403LOGIN");
    }
  }

  //set cookie to that users id
  req.session.user_id = userObj.id;
  res.redirect("/urls");
});


//register end point
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString(6);
  
  //if email or password are empty strings send back a 400 status code
  if (email === "" || password === "") {
    //400 empty due to required attribute on the ejs form, you cannot continue unless you fill this form
    return res.status(400);
  }
  if (getUserByEmail(email, users)) {
    res.status(400);
    return res.redirect("/urls_redirect/_400EXISTS");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = users[id].id;
  res.redirect("/urls");
});

//set up the logout route so the user can hit the logout button and get redirected back to login page and clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

/***************************  END *********************************/