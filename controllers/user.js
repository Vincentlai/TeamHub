var crypto = require('crypto');
var rand = require('csprng');
var mongoose = require('mongoose');
var models = require('../models/models.js');

exports.register = function (email, password, nickname, callback) {

    const MIN_PWD_LENGTH = 6;
    const emailValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    if (!email || !password || !nickname) {
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
            'msg': "Password is too short (minimum 6 characters)"
        });
        return;
    }


    // password encrytion
    var temp = rand(160, 36);
    var newpass = temp + password;
    var token = crypto.createHash('sha512').update(email + rand).digest("hex");
    var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");

    email = email.trim();
    nickname = nickname.trim();

    var newUser = new models.User
        ({
            token: token,
            email: email,
            hashed_password: hashed_password,
            nickname: nickname,
            is_verified: false,
            salt: temp,
            num_of_new_notif: 0
        });

    models.User.find({ email: email }, function (err, users) {

        if (users.length == 0) {

            models.User.find({ nickname: nickname }, function (err, users2) {

                if (users2.length == 0) {

                    // save user to database
                    newUser.save(function (err, user_obj) {

                        if (!err) {

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
                                html: '<b> To verify your email please open this URL using the host machine http://localhost:8080/users/verify?id=' + user_id + '</b>' // html body 
                            };

                            // send email verification
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    return console.log(error);
                                }
                                console.log('Verifcation Email sent: ' + info.response);
                            });

                            callback({
                                'code': "1",
                                'msg': "User registered, please verify your email"
                            });
                        }
                    });


                } else {

                    callback({
                        'code': "-4",
                        'msg': "This nickname is already taken"
                    });

                }

            });


        } else {
            callback({
                'code': "-1",
                'msg': "This Email already exists"
            });

        }
    });
}

exports.login = function (sess, email, password, callback) {

    if (!email || !password || email.trim().length == 0) {
        callback({
            'code': "-10",
            'msg': "Missing field"
        });
        return;
    }

    models.User.findOne({ email: email }, function (err, user_obj) {

        if (user_obj) {

            var user_id = user_obj.id;
            var temp = user_obj.salt;
            var hash_db = user_obj.hashed_password;
            var id = user_obj.token;
            var newpass = temp + password;
            var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");

            if (hash_db == hashed_password) {

                if (user_obj.is_verified) {

                    // update user_id in session
                    sess.user_id = user_obj._id;
                    sess.nickname = user_obj.nickname;


                    callback({
                        'code': "1",
                        'msg': "Login Success",
                        'email': email,
                        'nickname': user_obj.nickname,
                        'session_id': sess.id
                    });

                } else { // if not verified
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


exports.logout = function (sess, callback) {
    if (sess.user_id !== undefined) {
        sess.destroy(function (err) {
            callback({
                'code': "1",
                'msg': "Successfully logged out",
                'session_id': sess.id
            });
        });
    } else {
        callback({
            'code': "-1",
            'msg': "You haven't been logged in yet",
            'session_id': sess.id
        });
    }
}

exports.verify = function (id, callback) {

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

exports.isExist = function (email, callback) {

    models.User.find({ email: email }, function (err, users) {

        if (users.length != 0) {

            callback({
                'code': "1",
                'msg': "User found"
            });
            return;

        } else {

            callback({
                'code': "-1",
                'msg': "User not found"
            });
            return;
        }
    });
}

exports.myInfo = function (sess, callback) {

    var user_id = sess.user_id;

    if (!user_id) {

        callback({
            'code': '-9',
            'msg': 'No session, login required'
        });
        return;
    }

    models.User.find({ _id: user_id }, function (err, users) {

        if (users.length != 0) {

            callback({
                'code': "1",
                'msg': "Get my info Success",
                'email': users[0].email,
                'nickname': users[0].nickname,
                'teams': users[0].teams
            });
            return;

        } else {

            callback({
                'code': "-1",
                'msg': "User not found"
            });
            return;
        }
    });
}

exports.cpass = function (user_id, opass, npass, callback) {

    if (!user_id) {
        callback({
            'code': "-9",
            'msg': "No session"
        });
        return;
    }

    if (!opass || !npass) {
        callback({
            'code': "-10",
            'msg': "Missing fields"
        });
        return;
    }

    var temp1 = rand(160, 36);
    var newpass1 = temp1 + npass;
    var hashed_passwordn = crypto.createHash('sha512').update(newpass1).digest("hex");

    models.User.find({ _id: user_id }, function (err, users) {

        if (users.length != 0) {

            var temp = users[0].salt;
            var hash_db = users[0].hashed_password; var newpass = temp + opass;
            var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");

            if (hash_db == hashed_password) {
                if (npass.length >= 6) {

                    models.User.findOne({ _id: user_id }, function (err, doc) {
                        doc.hashed_password = hashed_passwordn;
                        doc.salt = temp1;
                        doc.save();

                        callback({
                            'code': "1",
                            'msg': "Password changed successfully"
                        });
                        return;
                    });

                } else {

                    callback({
                        'code': "-1",
                        'msg': "New password is too short"
                    });
                    return;
                }
            } else {

                callback({
                    'code': "-2",
                    'msg': "Incorrect old password"
                });
                return;

            }
        } else {

            callback({
                'code': "-3",
                'msg': "Error occurs"
            });
            return;

        }

    });
}