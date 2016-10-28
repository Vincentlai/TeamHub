module.exports = function(app) {

    app.get('/', function(req, res)
    {
        console.log("-> a user visited the page")
        console.log("** session_id: " + req.session.id);
        res.sendFile(__dirname + '/index.html');
    });


    var nodemailer = require('nodemailer');
 
	// create reusable transporter object using the default SMTP transport 
	var transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: 'noreplycmpt470group6@gmail.com', 
	        pass: 'aAcmpt470'
	    }
	});
	 
	// setup e-mail data with unicode symbols 
	var mailOptions = {
	    from: '"DoNotReply" <noreplycmpt470group6@gmail.com>', // sender address 
	    to: '1165637488@qq.com', // list of receivers 
	    subject: 'Please confirm your email', // Subject line 
	    text: 'Please click on this link to verify your email', // plaintext body 
	    html: '<b>Hello world 🐴</b>' // html body 
	};

	app.get('/emailtest', function(req, res)
    {

    	transporter.sendMail(mailOptions, function(error, info){
	    	if(error){
	        	return console.log(error);
	    	}
	    	console.log('Message sent: ' + info.response);
		});

        res.send("try to send email");
    });
 
	// send mail with defined transport object 
	//transporter.sendMail(mailOptions, function(error, info){
	//    if(error){
	//        return console.log(error);
	//    }
	//    console.log('Message sent: ' + info.response);
	//});
};