const express = require("express");
const methodOverride = require("method-override");
const app = express();
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser, authorizeUser } = require("./helpers");
const { PORT, SESSION_KEYS, ERROR } = require("./CONSTANTS");
const figlet = require("figlet");

app.use(methodOverride('_method'));

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
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

const urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
    click: 0,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
    click: 15,
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

//TODO stretch user tracking
const track = {
 
  // "tinyURL": {
  //   id: usersID if in user DB otherwise visitor ID,
  //   timeStamp: new Date(),
  //   uniqueVisitors: [],
  // }
};


/*************************** TESTs and DEV use **********************/
//root directory redirects to register
app.get("/", (req, res) => {
  res.redirect("/register");
});
//viewing the json handing for debugging
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/*************************** TESTs END ******************************/

/*************************** GET start ******************************/


//main page,
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  if (!users[id]) {
    return res.redirect("/urls_redirect/_401");
  }
  const url = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: url,
    users: users[req.session.user_id],
  };
  req.session.views = (req.session.views || 0) + 1;
  console.log(req.session.views);
  // console.log(users, urlDatabase, req.session.user_id, track);

  res.render("urls_index", templateVars);
});

//sends user to a page that will explicitly tell the users they must login or register
app.get("/urls_redirect/:error", (req, res) => {
  const id = req.session.user_id;
  const url = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: url,
    users: users[req.session.user_id],
    errorMessage: ERROR[req.params.error],
    errorTitle: req.params.error
  };
  console.log(templateVars, req.params.error);
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
//if a user is not logged in, display relevant message

  const id = req.session.user_id;
  const urlId = req.params.id;
  const isUserAuth = authorizeUser(req, users, urlDatabase);
  let clickNum = urlDatabase[urlId].click;

  if (isUserAuth !== (401 || 403 || 404)) {
 
    const templateVars = {
      id: urlId,
      longURL: urlDatabase[urlId].longURL,
      users: users[id],
      click: clickNum,
    };
    res.render("urls_show", templateVars);

  } else {
    res.status(isUserAuth);
    return res.redirect(`/urls_redirect/_ ${isUserAuth}`);
  }
});

//redirect any short url to the longurl
app.get("/u/:id", (req, res) => {
  const tiny = req.params.id;
  if (!urlDatabase[tiny]) {
    res.redirect("/urls_redirect/_404");
  }

  // const trackID = generateRandomString(16);
  // let id = '';

  // if (!users[req.session.user_id] && !track[trackID]) {
  //   id = trackID;

      
  // } else {
  //   id = req.session.user_id;
  // }
    
  //I want to first create a unique trackID
  //if the user is not logged in and there is no trackId value stored then create a new track object
  //if the user is logged in, set the current cookie to the trackId
  //we also need to set the trackID to a cookie that is tied to the not logged in user
  //we need to also compare this created cookie with the current user
  //if the current cookie doesn't match the trackId then we can create a new track object for that ID and link that to a cookie as well.

  // track[id] = {
  //   [tiny]: {
  //     trackId: id,
  //     timeStamp: new Date().toString(),
  //     uniqueVisitors: [],
  //   }
  // };
  // console.log(track);

  urlDatabase[req.params.id].click++;
  const longURL = urlDatabase[req.params.id].longURL;
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
  urlDatabase[tiny] = { longURL, userID, click };

  res.redirect('/urls/' + tiny);
  
});

//add a post method, made RESTful that will allow updating of the long url
app.put("/urls/:id", (req, res) => {
  //if user is not logged in, error
  const id = req.session.user_id;
  const isUserAuth = authorizeUser(req, users, urlDatabase);

  if (isUserAuth !== (401 || 403 || 404)) {
    const longURL = req.body.longURL;
    const userID = users[id].id;
    urlDatabase[req.params.id] = { longURL, userID };
    return res.redirect('/urls');
  } else {
    res.status(isUserAuth);
    return res.redirect(`/urls_redirect/_ ${isUserAuth}`);
  }

});

//once user submits the form by hitting delete on the urls index page, that item is immediately deleted and redirected to home page
//THIS HAS BEEN OVERRIDDEN TO A DELETE
app.delete("/urls/:id/delete", (req, res) => {
  const isUserAuth = authorizeUser(req, users, urlDatabase);

  if (isUserAuth !== (401 || 403 || 404)) {
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
  const uId = getUserByEmail(email, users);
  
  if (email === "" || password === "") {
    //400 empty due to required attribute on the ejs form, you cannot continue unless you fill this form
    return res.status(400);
  }

  //if the email search returns a empty object, that means user was not found
  if (!uId) {
    res.status(403);
    return res.redirect("/urls_redirect/_403LOGIN");
  } else {
    //must also check if the hashed passwords match
    if (!bcrypt.compareSync(password, uId.password)) {
      res.status(403);
      return res.redirect("/urls_redirect/_403");
    }
  }

  //set cookie to that users id
  req.session.user_id = uId.id;
  res.redirect("/urls");
});

//set up the logout route so the user can hit the logout button and get redirected back to login page and clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
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
    email: req.body.email,
    password: hashedPassword,
  };

  req.session.user_id = users[id].id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

/***************************  END *********************************/