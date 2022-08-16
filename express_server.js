const e = require("express");
const express = require("express");
const app = express();
const crypto = require("crypto");
const PORT = 8080;

app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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
      result += (Math.random() + 1).toString(36).substring(2, 3);
    } else {
      result += id[i];
    }

  }
  return result;
};

//root directory
app.get("/", (req, res) => {
  res.send("Hello!");
});
//viewing the json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//testing html output
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//main page, currently should also be redirected here
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//send user to the create new page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//form submission handling by updating the database
app.post("/urls", (req, res) => {
  const tiny = generateRandomString()
  urlDatabase[tiny] = req.body.longURL
  console.log(urlDatabase);
  res.redirect('/urls/'+ tiny);
});

//this will send the appropriate object to the show page in order to be displayed after form submission 
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});



app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})
//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

