# CMPT 470 FINAL PROJECT GROUP-6

## Team Collaboration Web Application

> A web application that helps project teams to collaborate in a fast, dynamic and real-time environment. The primary technologies that we used are Express.js, Node.js, Angular.js and MongoDB. We also used Socket.Io for building real-time chat and notification.

## Main Features 

- User registration
- Update personal info(change pwd, change avatar)
- Sign in/out
- Create/delete teams
- Invite/delete members to/from team
- Publish/delete new posts(text/pictures) in team
- Comment and Like on posts
- Create new event/meeting using calendar
- Instant team chat (supports both text and picture)
- File sharing (uploading/downloading files)
- Real-time Notification of team activities (Event reminder)

> All the features mentioned above work perfectly.

## Additional Features
- Minimalist UI design with consistency
- Team Filters in overview page for notification
- Files page allows smart search (atuo-filling file name) and different ordering options

## Browse http://localhost:3000/ to see the site 

## Testing accounts
1. Email:   `test_account_1@test.com`   Password: `cmpt470`
2. Email:   `test_account_2@test.com`   Password: `cmpt470`

## Reference
- We use NodeJs, ExpressJs, MongoDB and AngularJs to built this app
- A part of UI design used [Angular Material](https://material.angularjs.org/latest/) framework and [Material Icons](https://material.io/icons/)
- The event calendar used [Angular Material Event Calendar](https://github.com/B-3PO/angular-material-event-calendar) API
- We use [socket.io](http://socket.io/) to implement the real-time chatting and notification

## How to access DB (through GUI)

1. Make sure you've downloaded and installed [Robomongo](https://robomongo.org/)
2. Open Robomongo
3. Create a connection, Address: ec2-52-40-59-253.us-west-2.compute.amazonaws.com , use Default Port 27017
4. Click on Authentication tab, check `Perform authentication` and enter following information  
	**Database: cmpt470db  
    User Name: dev  
	Password: cmpt470
    Auth Mechanism: use default (Win)/ use MONGODB-CR(Mac)** 
5. Click on `Save`
6. Click on `Connect`
