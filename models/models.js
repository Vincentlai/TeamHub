var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    token: String,
    email: String,
    hashed_password: String,
    nickname: String,
    is_verified: Boolean,
    salt: String
});

//var chatContactSchema = mongoose.Schema({
//    my_user_id: String,
//    other_user_id: String,
//    last_msg: String,
//    last_msg_date_time: String,
//    number_of_unread_msg: Number
//});

//var chatHistorySchema = mongoose.Schema({
//    sender_user_id: String,
//    receiver_user_id: String,
//    message: String
//});

mongoose.connect('mongodb://dev:cmpt470@ec2-52-40-59-253.us-west-2.compute.amazonaws.com:27017/cmpt470db');
var User = mongoose.model('user', userSchema);
//var ChatContact = mongoose.model('chat_contact', chatContactSchema);
//var ChatHistory = mongoose.model('chat_history', chatHistorySchema);

module.exports = {
    User: User
    //ChatHistory: ChatHistory,
    //ChatContact: ChatContact
};