# CMPT 470 FINAL PROJECT GROUP-6

## Team Collaboration Web Application

> A web application that helps project teams to collaborate in a fast, dynamic and real-time environment. The primary technologies that we are going to use will be Express.js, Node.js, Angular.js and MongoDB.

## Features 

- User registration
- Update personal info(change pwd, etc)
- Sign in/out
- Create/delete groups
- Invite/delete memebers to/from group with Email alert
- Publish/delete new posts(text/pictures) in groups
- Comment on posts
- Create new event/meeting using calendar
- Instant group chat
- File sharing

## How to run on local
1. Make sure that you've installed [Node.js](https://nodejs.org/)
2. `git pull`
3. `npm install` --- **You might need to run this command multiple times if errors occur**
4. `gulp styles`  --- **If you are going to modify the .less files 
run `gulp` instead of `gulp styles`
and open a new terminal to run next step**
5. `node app.js`
6.  Browse http://localhost:8080/ to see the site 


## How to run on VM(Vagrant)

1. Make sure that you've installed Vagrant
2. Clone this repository
3. In terminal, run `$vagrant up`
4. Wait for VM to finish booting up
5. Browse http://localhost:8080/ to see the site 

## How to contribute  

1. Discuss what you're going to implement with your teammates
2. Create a new branch and name it with whatever you're going to implement
3. When you finish implementing the feature, test it and create a `merge request`. Please add a description for it.
4. Let your team know you have a `merge request` and it's ready for code review

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
