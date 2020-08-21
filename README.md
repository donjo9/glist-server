# G-list Server
Apollo Backend of G-List (Grocery List App)

### Getting started

#### prerequisite
+ Postgressql server
+ Node version 12+

#### Setup
+ Run user.sql against the server to create the relevant tables and columns
+ Rename .env.example to .env and fill it out with the revelevant information

#### Run Development
    npm run dev

#### Run "Production"
    node ./src/index.js
*Better to run it with a process manager like [PM2](https://pm2.keymetrics.io/)*
