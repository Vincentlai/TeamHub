  sudo apt-get -y install nginx
  sudo cp /home/ubuntu/project/default /etc/nginx/sites-available/default

  cd /home/ubuntu/project
  sudo npm install

  sudo forever start app.js
  sudo service nginx restart