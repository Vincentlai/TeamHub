var user = require('../user/user.js');

module.exports = function(app) {

    app.get('/', function(req, res)
    {
        console.log("-> a user visited the page")
        console.log("** session_id: " + req.session.id);
        res.sendFile(__dirname + '/index.html');
    });

	app.post('/user/register',function(req, res)
    {
        console.log("-> register called");

        var email = req.body.email;
        var password = req.body.password;
        var nickname = req.body.nickname;

        user.register(email, password, nickname, function (found) {
            console.log(found);
            res.json(found);
        });
	});

	app.post('/user/login',function(req, res)
    {
        var sess = req.session;
        console.log("-> login called");
        console.log("** session_id: " + sess.id);

        var email = req.body.email;
        var password = req.body.password;

        user.login(sess,email,password,function (found){
            console.log(found);
            res.json(found);
            console.log("** user_id: " + sess.user_id);
        });
	});

	app.post('/user/logout', function(req, res)
    {
        var sess = req.session;
        console.log("-> logout is called");
        console.log("** session_id: " + sess.id);
        console.log("** user_id: " + sess.user_id + " destroyed" + "\n");
        
        user.logout(sess, function(found) {
            res.json(found);
        });
	});

    app.get('/user/verify', function(req, res)
    {
        console.log("-> verify called");

		if(req.param("id")){
			var id = req.param("id");
			user.verify(id,function (found){
				console.log(found);
				res.json(found);
        	});

		}else{
			res.status(400);
			res.send('Invalid Request');
		}
    });

};