const express = require("express");
const methodOverride = require("method-override")
const app = express();
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const { PORT, SESSION_KEYS, ERROR } = require("./CONSTANTS")
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

const track = {
 
  // "tinyURL": {
  //   id: usersID if in user DB otherwise visitor ID,
  //   timeStamp: new Date(),
  //   uniqueVisitors: [],
  // }
}



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
    return res.redirect("/urls_redirect/_401");
  }
  const url = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: url,
    users: users[req.session.user_id],
  };
req.session.views = (req.session.views || 0) + 1
console.log(req.session.views)
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
  console.log(templateVars, req.params.error)
  res.render("urls_redirect", templateVars);
});

//send user to the create new page
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id
  const templateVars = {
    users: users[id],
  };

  if (!templateVars.users) {
    //not logged in
    res.status(401)
    return res.redirect("/urls_redirect/_401");
  }

  res.render("urls_new", templateVars);
  
});



//this will send the appropriate object to the show (edit) page in order to be displayed after form submission
app.get("/urls/:id", (req, res) => {
//if a user is not logged in, display relevant message
//TODO redirect to "urls_redirect" after a modal message
  const id = req.session.user_id;
  const urlId = req.params.id
  let clickNum = urlDatabase[urlId].click;
  if (!users[id]) {
    res.status(401);
    return res.redirect("/urls_redirect/_401")
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    return res.redirect("/urls_redirect/_404")
  }

  //if a user is logged in, but the id doesn't match the set cookie then the user doesn't have permission to access the url
  //TODO same as above TODO ^^
  if (urlDatabase[req.params.id].userID !== id) {
    //403
    res.status(403);
    return res.redirect("/urls_redirect/_403")
  }

  const templateVars = {
    id: urlId,
    longURL: urlDatabase[urlId].longURL,
    users: users[id],
    click: clickNum,
  };
  res.render("urls_show", templateVars);
});


//redirect any short url to the longurl
app.get("/u/:id", (req, res) => {
  // const { id, password, email} = req.body
  const trackID = generateRandomString(16);
  const tiny = req.params.id;
  let id ='';

  if (!urlDatabase[req.params.id]) {
    //404
    res.redirect("/urls_redirect/_404")
  }

  if (!users[req.session.user_id] && !track[trackID]) {
      id = trackID 

      
  } else {
    id = req.session.user_id;
  }
    
//I want to first create a unique trackID 
//if the user is not logged in and there is no trackId value stored then create a new track object
//if the user is logged in, set the current cookie to the trackId
//we also need to set the trackID to a cookie that is tied to the not logged in user
//we need to also compare this created cookie with the current user 
//if the current cookie doesn't match the trackId then we can create a new track object for that ID and link that to a cookie as well.

  track[id] = {
    [tiny]: {
      trackId: id,
      timeStamp: new Date().toString(),
      uniqueVisitors: [],
    }
  }
  console.log(track)
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
    return  res.redirect("/urls");
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
    return res.redirect("/urls_redirect/_401")
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
  if (!users[id]) {
    res.status(401);
    return res.redirect("/urls_redirect/_401")
    
  } else if (!urlDatabase[req.params.id]) {
    //if id doesn't exist, error, assume id of the short URL, for cURL requests
    res.status(404);
    return res.redirect("/urls_redirect/_404");

  } else if (urlDatabase[req.params.id].userID !== id) {
  //if user that is logged in but isn't the owner of the tinyURL cannot edit
    res.status(403);
    return res.redirect("/urls_redirect/_403")

  } else {
    const longURL = req.body.longURL;
    const userID = users[id].id;
    urlDatabase[req.params.id] = { longURL, userID };
    return res.redirect('/urls');
  }
});

//once user submits the form by hitting delete on the urls index page, that item is immediately deleted and redirected to home page
//THIS HAS BEEN OVERRIDDEN TO A DELETE
//TODO add a confirmation window before delete, possibly undo??
app.delete("/urls/:id/delete", (req, res) => {
  //if user is not logged in, error
  const id = req.session.user_id;
  if (!users[id]) {
    res.status(401);
    return res.redirect("/urls_redirect/_401")

  } else if (!urlDatabase[req.params.id]) {
    //if id doesn't exist, error assume id of the short URL, for cURL requests
    //404
    res.status(404);
    return res.redirect("/urls_redirect/_404")

  } else if (urlDatabase[req.params.id].userID !== id) {
    //if user doesn't own that url, error
    res.status(403);
    //403
    return res.redirect("/urls_redirect/_403")

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
    //400 empty
    return res.status(400);
  }
  
  //if the email search returns a empty object, that means user was not found
  if (!uId) {
    //403 login
    res.status(403);
    return res.redirect("/urls_redirect/_403LOGIN")
  } else {
    //must also check if the hashed passwords match
    if (!bcrypt.compareSync(password, uId.password)) {
      //403
      res.status(403);
      return res.redirect("/urls_redirect/_403")
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
  const id = generateRandomString(6);
  
  //if email or password are empty strings send back a 400 status code
  
  if (email === "" || password === "") {
    //400 empty
    return res.status(400);
  }
  
  if (getUserByEmail(email, users)) {
    //400 exists
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

