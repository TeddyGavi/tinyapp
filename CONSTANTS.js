const PORT = 8080;
const SESSION_KEYS = ['I believe this will use key at 0, then allow for rotation'];
const ERROR = {
  _400EMPTY: "The fields entered cannot be empty!",
  _400EXISTS: "The information you entered already exists!",
  _401: "You are not logged in! You don't have permission to continue!",
  _403LOGIN: "You were not found in the database please try again or register!",
  _403: "You do not have permission to continue! ",
  _404: "This TinyURL does not exist!",
};

module.exports = { PORT, SESSION_KEYS, ERROR };