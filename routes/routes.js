module.exports = function(app) {

    app.get('/', function(req, res)
    {
        console.log("-> a user visited the page")
        console.log("** session_id: " + req.session.id);
        res.sendFile(__dirname + '/index.html');
    });
};