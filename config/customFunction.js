
const { response } = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios')

module.exports = {
    isUserAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        }
        else{
            res.redirect('/auth');
        }
    }, 

    loggedIn: async (req, res, next) => {
        if (req.session.loggedin) {
            try {
                const response = await axios.get('http://localhost:9090/partner/verify', {
                    headers: {
                        "Content-type": "application/json",
                        "Authorization": `Bearer ${req.session.token}`
                    }
                });
    
                if (response.status === 200) {
                    if (req.session.email == response.data.user.email) {
                        req.session.save();
                        next();
                    } else {
                        res.redirect('/auth');
                    }
                } else {
                    res.redirect('/auth');
                }
            } catch (error) {
                res.redirect('/auth');
            }
        } else {
            res.redirect('/auth');
        }
    },
    
    xloggedIn: (req, res, next) => {
        if(req.session.loggedin || req.session.email){
            req.session.save();
            next();
        }else{
            res.redirect('/auth');
        }
    },


    isEmpty: function(obj) {
        for (let key in obj) {
            if(obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    },

    // Generate a JWT API key
        generateAPIKey: function (user) {
            const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            pId: user.pId
            };
            const apiKey = jwt.sign(payload, process.env.SECRET);
        
            return apiKey;
        }

}