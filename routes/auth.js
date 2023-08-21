const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const passport  = require('passport');
const localStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const mysql = require('mysql')
const {pool} = require('../config/config');
const flash = require("connect-flash");
const axios = require('axios')

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'auth';

    next();
});

router.get('/',  (req, res) => {
 res.redirect('auth/signin')
});

router.get('/signin',  (req, res) => {
 res.render('auth/signin')
});





passport.use(new localStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (req, email, password, done) => {

    pool.getConnection((err, connection) => {
        if (err){
            console.log(err)
        }else{
            connection.query(`SELECT * FROM users WHERE email = ?`, email, (err, user) => {
                if (err){
                    return done(null, false)
                }
                bcrypt.compare(password, user.password, (err, passwordMatched) => {
                    if(err){
                        return err;
                    }
                    
                    if (!passwordMatched){
                        return done(null, false)
                    }
        
                    return done(null, user)
                });
            })
        }
    })
 
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    pool.getConnection((err, connection) => {
        if (!err){
            connection.query(`SELECT * FROM users WHERE id = ?`, id, (err, user) =>{
                done(err, user)
            } )
        }
    })
});

router.post('/signin', (req, res) => {
    const form = {
        email: req.body.email,
        password: req.body.password
    };

    axios.post('http://localhost:9090/partner/login', form, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        const userData = response.data;
        if (response.status === 200) {
            const userData = response.data;

            req.session.token = userData.token; 
            req.session.loggedin = true;
            req.session.userfull = userData.data.fullName;
            req.session.user = userData.data.firstName;
            req.session.email = userData.data.email;
            req.session.merchant_id = userData.data.merchant_id;
            req.session.merchant_name = userData.data.merchant_name;
            res.redirect('/'); 
        } else if (response.status === 401) {
            console.log(401);
            req.flash("msg", "Invalid username or password")
            res.redirect('/auth');
        } else if (response.status === 400) {
            console.log(400);
             req.flash("msg", "Your account is currently under review, please contact support if this persist more than 24 hours")
            res.redirect('/auth');
        }
    })
    .catch(error => {

        if (!error.response){
            const msg = 'Connection error, please try again';
            res.render('auth/signin', {msg});
        }else{
            const msg = error.response.data.msg ? error.response.data.msg : error.response.data;
            res.render('auth/signin', {msg});
        }
    });
});



// router.post('/signin', (req, res) => {
//     const email = req.body.email
//     const password = req.body.password;

//     // API signin call 
//     pool.getConnection((err, connection) => {
//         if (!err){
//             connection.query(`SELECT * FROM merchant_users WHERE email = ?`, email, (err, user) => {
//                 if (user.length >= 1){
//                     var userPassword = user[0].password;
//                     bcrypt.compare(password, userPassword, (err, matchedPassword) => {
//                         if (matchedPassword === true){

//                             if(user[0].activation == "false"){
//                                 req.flash("msg", "Invalid username or password")
//                                 res.redirect('/auth')

//                             }else if(user[0].status !== "Active"){
                                
//                                 req.flash("msg", "Your account is currently under review, please contact support if this persist more than 24 hours")
//                                 res.redirect('/auth')
//                             }else{
//                                 req.session.loggedin = true;
//                                 req.session.userfull = user[0].first_name + ' ' + user[0].last_name;
//                                 req.session.user = user[0].first_name
//                                 req.session.merchant_id = user[0].merchant_id;
//                                 req.session.merchant_name = user[0].merchant_name;
//                                 res.redirect('/')

//                             }
//                         }else{
//                             req.flash("msg", "Invalid username or password")
//                             res.redirect('/auth')
//                         }
//                     })
//                 }else{
//                     req.flash("msg", "Invalid username or password")
//                     res.redirect('/auth')
//                 }
//             })
//         }else{
//             req.flash("msg", "Something went wrong!")
//             res.redirect('/auth')
//         }
//     })
// });


router.get('/404', (req, res) =>{
    res.render('auth/404')
})



module.exports = router;