## TinyApp

- This web app will allow users to shorten long URLs much like TinyURL.com and bit.ly do.

### Goals
- Build a simple multi-page web app:
  - [x] authentication protection
  - [x] reacts to a users logged in state
  - [x] allows for CRUD operations

### Quick Start:
1. clone and download the GitHub repo and setup dependencies with ```npm install```
2. Navigate to /confirm the repo directory in your terminal. ```cd...```
3. start the TinyApp server in your terminal ```node express_server.js```
4. browse to ```localhost:8080/``` in any browser to get started.

#### NOTE:
- it may be useful to install morgan for code review purposes, if yes, you will need to head to [morgan](https://www.npmjs.com/package/morgan) to download.

### Features:
- [x] **stretch**: show total clicks on a tinyURL in edit page
- [x] **stretch**: show _unique_ clicks on a tinyURL
### Future Goals
- [ ] **stretch**: show _log_ including timestamp, visits, etc 
- [ ] add a userDB and urlDB file logging through the ```fs module```
- [ ] add error handling and validating for url entries and duplicate entries
- [ ] write unit tests for ```authorizeUser()```
- [ ] accessibility considerations need to be addressed
- [ ] login portion of header (when displayed) /logout doesn't collapse with the navbar properly when adjusting for different display sizes
- [ ] Create footers

### Views:
- On loading the app you will need to register or login:
![Login](https://github.com/TeddyGavi/tinyapp/blob/main/docs/Screenshot1login.png)
- You are now able to view your tinyUrls! 
![urls](https://github.com/TeddyGavi/tinyapp/blob/main/docs/Screenshot2urls.png)
- You can edit each longURL and view the click/unique visits count:
![edit](https://github.com/TeddyGavi/tinyapp/blob/main/docs/Screen3edit.png)
- please be certain you want to delete!
![delete](https://github.com/TeddyGavi/tinyapp/blob/main/docs/delete.png)



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




