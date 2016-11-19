var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    token: String,
    email: String,
    hashed_password: String,
    nickname: String,
    is_verified: Boolean,
    salt: String,
    teams: [{
        id: String,
        name: String,
        is_creator: Boolean
    }],
    num_of_new_notif: Number,
    notifications: [String]
});

var teamSchema = mongoose.Schema({
    name: String,
    description: String,
    creator_id: String,
    users: [{
        id: String,
        nickname: String
    }]
});

var postSchema = mongoose.Schema({
    team_id: String,
    nickname: String,
    user_id: String,
    text: String,
    pic_id: String,
    likes: [{
        user_id: String,
        nickname: String
    }],
    comments: [{
        user_id: String,
        nickname: String,
        comment: String
    }]
});


var eventSchema = mongoose.Schema({
    team_id: String,
    title: String,
    description: String,
    start: String,
    end: String,
    creator_id: String,
    creator_nickname: String
});

var avatarSchema = mongoose.Schema({
    user_id: String,
    data: Buffer,
    content_type: String
})

var chatHistorySchema = mongoose.Schema({
    team_id: String,
    nickname: String,
    user_id: String,
    time: String,
    message: String
});

mongoose.connect('mongodb://dev:cmpt470@ec2-52-40-59-253.us-west-2.compute.amazonaws.com:27017/cmpt470db');
var User = mongoose.model('user', userSchema);
var Team = mongoose.model('team', teamSchema);
var Post = mongoose.model('post', postSchema);
var Event = mongoose.model('event', eventSchema);
var ChatHistory = mongoose.model('chat_history', chatHistorySchema);
var Avatar = mongoose.model('avatar', avatarSchema);

module.exports = {
    User: User,
    Team: Team,
    Post: Post,
    Event: Event,
    ChatHistory: ChatHistory,
    Avatar: Avatar
};