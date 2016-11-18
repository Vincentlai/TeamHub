var express = require('express');
var router = express.Router();
var event = require('../controllers/event.js');

/* PATH: host_url:8080/events/create (POST)
 *
 * INPUT: 'team_id' : team post to
 *        'title'
 *        'description'
 *        'start' : start date
 *        'end': end date
 *      
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *
 *   1 -> Create event successfully
 *  -1 -> Invalid team_id
 *  -2 -> You are not belong to this team
 *  -3 -> Both title and description cannot be empty
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.post('/create', function (req, res) {

    console.log("-> create called");

    var team_id = req.body.team_id;
    var title = req.body.title;
    var description = req.body.description;
    var start = req.body.start;
    var end = req.body.end;
    var sess = req.session;

    event.create(sess, team_id, title, description, start, end, function (found) {
        console.log(found);
        res.json(found);
    });
});

/* PATH: host_url:8080/events/get?team_id=1234567890 (GET)
 *
 * INPUT: 'team_id' : get all events for this team
 * 
 * OUTPUT:
 *  JSON Object that contains
 *  'code' : respond code
 *  'msg' : respond message
 *  'events' :{                    (list of events for one team)
                title: String
                description: String
                start: String
                end: String
                creator_id: String
                creator_name: String
 *            }
 *
 *   1 -> Get events successfully
 *  -1 -> Invalid team_id
 *  -2 -> You are not belong to this team
 *  -3 -> There is no event in this team
 *  -9 -> No session, login required
 *  -10 -> Missing fields
 * 
 */
router.get('/get', function (req, res) {

    console.log("-> create called");

    var team_id = req.query.team_id;
    var sess = req.session;

    event.getEvents(sess, team_id, function (found) {
        console.log(found);
        res.json(found);
    });
});


module.exports = router;