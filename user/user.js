var crypto = require('crypto');
var rand = require('csprng');
var mongoose = require('mongoose');
var models = require('../models/models.js');

/* PATH: host_url:8080/user/register
 *
 * INPUT:
 * 'email'
 * 'password'
 * 'nickname'
 *
 * OUTPUT: JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *  1 -> Successfully registered, verify email
 * -1 -> Email already exists
 * -2 -> Invalid email format
 * -3 -> Password is too short
 * -10 -> Missing field
 */
exports.register = function(email, password, nickname, callback) {

    const MIN_PWD_LENGTH = 6;
    const emailValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    if(!email || !password || !nickname){
        callback({
            'code': "-10",
            'msg': "Missing field"
        });
        return;
    }

    if (!emailValidation.test(email)) {
        callback({
            'code': "-2",
            'msg': "Invalid email format"
        });
        return;
    }
    
    if (!(password.length >= MIN_PWD_LENGTH)) {
        callback({
            'code': "-3",
            'msg': "Password is too weak"
        });
        return;
    }


    // password encrytion
    var temp = rand(160, 36);
    var newpass = temp + password;
    var token = crypto.createHash('sha512').update(email + rand).digest("hex");
    var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");

    var newUser = new models.User
    ({
        token: token,
        email: email,
        hashed_password: hashed_password,
        nickname: nickname,
        is_verified: false,
        salt: temp
    });

    models.User.find({email: email},function(err,users){

    if(users.length == 0){

        // save user to database
        newUser.save(function (err, user_obj) {

            if(!err){

                var user_id = user_obj.id;

                var nodemailer = require('nodemailer');

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'noreplycmpt470group6@gmail.com', 
                        pass: 'aAcmpt470'
                    }
                });
                
                var mailOptions = {
                    from: '"DoNotReply" <noreplycmpt470group6@gmail.com>', // sender address 
                    to: email, // list of receivers 
                    subject: 'Please verify your email', // Subject line 
                    //text: 'Please click on this link to verify your email', // plaintext body 
                    html: '<b> To verify your email please open this URL using the host machine http://localhost:8080/user/verify?id=' + user_id + '</b>' // html body 
                };

                // send email verification
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    console.log('Verifcation Email sent: ' + info.response);
                });

                callback({
                    'code' : "1",
                    'msg':"User registered, please verify your email"
                });
            }
        });    

    }else{
        callback({
            'code' : "-1",
            'msg':"Email already exists"
        });
    }});
}

/* PATH: host_url:8080/user/login
 *
 * INPUT:
 * 'email'
 * 'password'
 *
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'session_id' : upon successful login a session id will be provided (only for debug purposes)
 *
 *
 *  1 -> Successfully logged in
 * -1 -> Email not registered
 * -2 -> Incorrect Password
 * -3 -> Email not verified
 * -10 -> Missing field
 */
exports.login = function(sess,email,password,callback) {

    if (!email || !password || email.trim().length == 0) {
        callback({
            'code': "-10",
            'msg': "Missing field"
        });
        return;
    }

    models.User.find({email: email}, function (err, users) {

        if (users.length != 0) {
            
            var user_id = users[0].id;
            var temp = users[0].salt;
            var hash_db = users[0].hashed_password;
            var id = users[0].token;
            var newpass = temp + password;
            var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");

            if (hash_db == hashed_password) {

                if(users[0].is_verified){

                    // update user_id in session
                    sess.user_id = users[0]._id;

                    callback({
                        'code': "1",
                        'msg': "Login Success",
                        'session_id': sess.id
                    });
                
                }else{ // if not verified
                    callback({
                        'code': "-3",
                        'msg': "Email has not been verified"
                    });     
                }

            } else {

                callback({
                    'code': "-2",
                    'msg': "Incorrect Password"
                });
            }

        } else {
            callback({
                'code': "-1",
                'msg': "Email not registered"
            });
        }
    });
}


/* PATH: host_url:8080/user/logout
 *
 * INPUT: None
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'session_id' : a session id will be provided (only for debug purposes)
 *
 *  1 -> Successfully logged out
 *  -1 -> You haven't been logged in yet
 */
exports.logout = function(sess, callback){
    if(sess.user_id !== undefined) {
        sess.destroy(function (err) {
            callback({
                'code': "1",
                'msg': "Successfully logged out",
                'session_id': sess.id
            });
        });
    }else{
        callback({
            'code': "-1",
            'msg': "You haven't been logged in yet",
            'session_id': sess.id
        });
    }
}

/* PATH: host_url:8080/user/verify?id=12345678910 (GET)
 *
 * INPUT:
 * 'id' as param 
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *
 *  1 -> Successfully verified
 * -1 -> Invalid id
*/
exports.verify = function(id,callback) {

    models.User.findById(id, function (err, users) {

        if (!users) {

            callback({
                'code': "-1",
                'msg': "Invalid id"
            });
            return;

        } else {

            users.is_verified = true;
            users.save();

            callback({
                'code': "1",
                'msg': "Email has been verified successfully"
            });
            return;
        }
    });
}