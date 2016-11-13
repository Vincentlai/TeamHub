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
 *  1 -> Success
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
 *  1 -> Delete success
 *  -1 -> Invalid team_id
 *  -2 -> You're not the creator of this team
 *  -9 -> No session, login required
 *  -10 -> Team_id is missing
 * 
 */
router.delete('/delete',function(req, res)
{
    console.log("-> delete group called");

    var team_id = req.param("team_id");
    var sess = req.session;

    team.delete(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/teams/add_user (POST)
 *
 * INPUT: 'team_id' : team to add to
 *        'user_id' : the user that you want to add
 *        'message' (optional)
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *  1 -> User is added successfully
 *  -1 -> Invalid team_id
 *  -2 -> You're not the creator of this team
 *  -3 -> Invalid user_id
 *  -4 -> Cannot add same user twice
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.post('/add_user',function(req, res)
{
    console.log("-> add_user called");

    var team_id = req.body.team_id;
    var user_id = req.body.user_id;
    var message = req.body.message;
    var sess = req.session;

    team.addUser(sess, team_id, user_id, message, function (found) {
        console.log(found);
        res.json(found);
    });
});


/* PATH: host_url:8080/teams/remove_user (DELETE)
 *
 * INPUT: 'team_id' : team to remove from
 *        'user_id' : the user that you want to remove
 *        'message' (optional)
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *  1 -> User is removed successfully
 *  -1 -> Invalid team_id
 *  -2 -> You're not the creator of this team
 *  -3 -> Invalid user_id
 *  -4 -> This user is not in the team
 *  -5 -> You cannot remove the creator
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.delete('/remove_user',function(req, res)
{
    console.log("-> remove_user called");

    var team_id = req.param("team_id");
    var user_id = req.param("user_id");
    var message = req.param("message");
    var sess = req.session;

    team.removeUser(sess, team_id, user_id, message, function (found) {
        console.log(found);
        res.json(found);
    });
});


module.exports = router;