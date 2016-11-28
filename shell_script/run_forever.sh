  sudo apt-get -y install nginx
  sudo cp /home/ubuntu/project/default /etc/nginx/sites-available/default
  sudo cp /home/ubuntu/project/shell_script/chat.js /home/ubuntu/project/public/js/chat.js
  sudo service nginx restart

  cd /home/ubuntu/project
  sudo npm install

  sudo forever start app.js