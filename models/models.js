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
    }],
    news: [{
        user_id: String,
        user_nickname: String,
        action_name: String,
        action_target: String,
        action_target_id: String,
        target_team_id: String,
        target_team_name: String
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
    }],
    files: [{
        file_id: String,
        file_name: String
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
});

var chatHistorySchema = mongoose.Schema({
    team_id: String,
    nickname: String,
    user_id: String,
    time: String,
    message: String,
    file_id: String
});

var fileSchema = mongoose.Schema({
    team_id: String,
    owner_user_id: String,
    owner_nickname: String,
    file_name: String, // full name including suffix
    file_size: Number, // in Bytes
    post_id: String,
    is_pic: Boolean // is picture or not
});

var fileDataSchema = mongoose.Schema({
    file_id: String,
    data: Buffer,
    content_type: String
});

mongoose.connect('mongodb://dev:cmpt470@ec2-52-40-59-253.us-west-2.compute.amazonaws.com:27017/cmpt470db');
var User = mongoose.model('user', userSchema);
var Team = mongoose.model('team', teamSchema);
var Post = mongoose.model('post', postSchema);
var Event = mongoose.model('event', eventSchema);
var ChatHistory = mongoose.model('chat_history', chatHistorySchema);
var Avatar = mongoose.model('avatar', avatarSchema);
var File = mongoose.model('file', fileSchema);
var FileData = mongoose.model('file_data', fileDataSchema);

module.exports = {
    User: User,
    Team: Team,
    Post: Post,
    Event: Event,
    ChatHistory: ChatHistory,
    Avatar: Avatar,
    File: File,
    FileData: FileData
};