## TinyApp

- This web app will allow users to shorten long URLs much like TinyURL.com and bit.ly do.

### Goals
- Build a simple multipage web app:
  - [x] authentication protection
  - [x] reacts to a users logged in state
  - [x] allows for CRUD operations

### Quick Start:
1. clone and download the GitHub repo and setup dependencies with ```npm install```
2. start the TinyApp server in your terminal ```node express_server.js```
3. browse to ```localhost:8080/``` to get started

### Features:
- **stretch**: show total clicks on a tinyURL in edit page
### Future Goals
- **stretch**: show _unique_ clicks on a tinyURL
- **stretch**: show _log_ including timestamp, visits, etc
- add a userDB and urlDB file logging through the ```fs module```
- add error handling for url entries
- accessibility considerations need to be addressed
- Create footers

### Views:
- on loading the app you will need to register or login:
![Login](Screenshot1login.png)
<!-- ![urls](Screenshot2urls.png) -->
- You can edit each longURL and view the click count:
![edit](Screenshot3edit.png)
- please be certain you want to delete!
![delete](delete.png)



#### Dependencies
- bcryptjs
- chalk
- cookie-parser
- cookie-session
- ejs
- express 
- figlet
- method-override
#### DevDependencies
- chai
- mocha
- morgan
- nodemon




