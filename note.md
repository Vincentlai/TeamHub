# Note for teammates when make global changes

## Get current user info after login

In your angular controller  
include `$rootScope`  
use `$rootScope.user` to get user info  
is has two keys `email` and `nickname`  

## Get current user selected team

In your angular controller  
include `$localStorage`  
user `$localStorage.selectedTeam` to get team info  
it has three keys `name`, `id`, and `is_creator`  
** $localStorage is still in the browser storage after close the browser or logout  
** May use another way to store the selected team later

