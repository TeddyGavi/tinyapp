const e = require("express");
const express = require("express");
const app = express();
const morgan = require('morgan')
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const PORT = 8080;

app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// const templateVars = {
//   username: req.cookies[username],
// }

// res.render("/_header", templateVars)

//function that employs crypto to help generate random 6 character string
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


/*************************** TESTs ******************************/
//root directory redirects to urls index will change later
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls")
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



//main page, currently should also be redirected here
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
   username: req.cookies.username,
  };
  res.render("urls_index", templateVars);
});

//send user to the create new page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  }
  res.render("urls_new", templateVars);
});



//this will send the appropriate object to the show page in order to be displayed after form submission 
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookie.username,
  };
  res.render("urls_show", templateVars);
});


//redirect any short url to the longurl 
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

/**************************POST********************************/

//form submission handling by updating the database
app.post("/urls", (req, res) => {
  const tiny = generateRandomString()
  urlDatabase[tiny] = req.body.longURL
  console.log(urlDatabase);
  res.redirect('/urls/'+ tiny);
});

//add a post method that will allow updating of the long url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
})

//once user submits the form by hitting delete on the urls index page, that item is immediately deleted and redirected to home page 
//TODO add a confirmation window before delete, possibly undo??
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls")
})

//when a user logs in we set a cookie named "username"
//also displayed to the server for now
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  console.log('cookies', req.cookies)
  console.log(req.body)
  res.redirect("/urls")
})

//set up the logout route so the user can hit the logout button and get redirected back to root
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// const onCheck = () => {
//   if (confirm("Are you certain")) {
//     app.post("/urls/:id/delete", (req, res) => {
//       // res.render(alert("Are you certain?"))
//       delete urlDatabase[req.params.id];
//       res.redirect("/urls")
//   })
//   } else {
//     res.redirect("/urls")
//   }
// }

// module.exports = onCheck