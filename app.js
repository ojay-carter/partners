const express = require('express');
const path = require('path');
require('dotenv').config();
const hbs = require('express-handlebars');
const {option, PORT} = require('./config/config');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const passport  = require('passport');
const mysqlStore = require('express-mysql-session');
const multer = require('multer');
const {check, validator} = require('express-validator')


/* Express */
const app = express();
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true, limit: "50mb"}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());




/* MYSQL */


const sessionStore = new mysqlStore(option);


/* Flash and Sessions */
app.use(flash());

app.use(session({
    store: sessionStore,
    name: 'userSession',
    secret: 'lahsermania',
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 14406666666}
}));


/* Method Override */
app.use(methodOverride('newMethod'));

/* file Uploaad*/
app.use(fileUpload());

/* Handlebars */
app.engine('handlebars', hbs({defaultLayout: 'default'}));
app.set('view engine', 'handlebars');




/* Routes */
const defaultRoutes = require('./routes/defaultRoutes')
app.use('/', defaultRoutes)

const auth = require('./routes/auth');
app.use('/auth', auth);


app.listen(PORT, () =>  {
    console.log(`Your Server is running at port ${PORT}`)
});


