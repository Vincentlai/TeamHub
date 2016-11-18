var express = require('express');
var router = express.Router();
var team = require('../controllers/team.js');

/* PATH: host_url:8080/teams/create (POST)
 *
 * INPUT: 'name'
 *        'description'
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Success
 *  -1 -> Name already taken
 *  -2 -> Error
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.post('/create',function(req, res)
{
    console.log("-> create group called");

    var name = req.body.name;
    var description = req.body.description;
    var sess = req.session;

    team.create(sess, name, description, function (found) {
        console.log(found);
        res.json(found);
    });
});


/* PATH: host_url:8080/teams/delete (DELETE)
 *
 * INPUT: 'team_id'
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Delete success
 *  -1 -> Invalid team_id
 *  -2 -> You're not the creator of this team
 *  -9 -> No session, login required
 *  -10 -> Team_id is missing
 * 
 */
router.delete('/delete',function(req, res)
{
    console.log("-> delete group called");

    var team_id = req.query.team_id;
    var sess = req.session;

    team.delete(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/teams/add_user (POST)
 *
 * INPUT: 'team_id' : team to add to
 *        'user_id' or 'email' or 'nickname' : the user identifier that you want to add
 *        'message' (optional)
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> User is added successfully
 *  -1 -> Invalid team_id
 *  -2 -> You're not the creator of this team
 *  -3 -> Invalid user identifier   
 *  -4 -> Cannot add same user twice
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.post('/add_user',function(req, res)
{
    console.log("-> add_user called");
    console.log(req.body);
    var team_id = req.body.team_id;
    var user_id = req.body.user_id;
    var email = req.body.email;
    var nickname = req.body.nickname;
    var message = req.body.message;
    var sess = req.session;

    team.addUser(sess, team_id, user_id, email, nickname, message, function (found) {
        console.log(found);
        res.json(found);
    });
});


/* PATH: host_url:8080/teams/remove_user (DELETE)
 *
 * INPUT: 'team_id' : team to remove from
 *        'user_id' or 'email' or 'nickname' : the user identifier that you want to remove
 *        'message' (optional)
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> User is removed successfully
 *  -1 -> Invalid team_id
 *  -2 -> You're not the creator of this team
 *  -3 -> Invalid user identifier
 *  -4 -> This user is not in the team
 *  -5 -> You cannot remove the creator
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.delete('/remove_user',function(req, res)
{
    console.log("-> remove_user called");

    var team_id = req.query.team_id;
    var user_id = req.query.user_id;
    var email = req.query.email;
    var nickname = req.query.nickname;
    var message = req.query.message;
    var sess = req.session;

    team.removeUser(sess, team_id, user_id, email, nickname, message, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/teams/quit (DELETE)
 *
 * INPUT: 'team_id' : team to quit
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Quit team successfully
 *  -1 -> Invalid team_id
 *  -2 -> You're not in this team
 *  -3 -> Cannot quit this team because you're the creator
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.delete('/quit',function(req, res)
{
    console.log("-> quit called");

    var team_id = req.query.team_id;
    var sess = req.session;

    team.quit(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/teams/team_info (GET)
 *
 * INPUT: 'team_id' : team to get info from
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'name' : team name
 *  'description' : team description
 *  'r_u_creator' : (Boolean) the requester is creator or not
 *  'users' : users json array
 *
 *   1 -> Get team info successfully
 *  -1 -> Invalid team_id
 *  -2 -> Permission denied, you're not in this team
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.get('/team_info',function(req, res)
{
    console.log("-> team_info called");

    var team_id = req.query.team_id;
    var sess = req.session;

    team.teamInfo(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});



module.exports = router;