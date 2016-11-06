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
 *  1 -> success
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

router.post('/delete',function(req, res)
{
    console.log("-> delete group called");

    var team_id = req.body.team_id;
    var sess = req.session;

    team.delete(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});

module.exports = router;