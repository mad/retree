VK.init({apiId: 2393864});
alert("huiiiii");
VK.api("getProfiles", {uids:"1,2,3,4"}, function(data) {
	alert(data); 
 });
