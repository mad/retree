VK.Widgets.Auth("vk_auth", {
		    width: "200px", 
		    onAuth: function(data) {
		    }
		});

var mainData;

var postOwner = 66749591;
var postId = 5796;
var root = {};
root['root_owner_id'] = postOwner;
root['root_post_id'] = postId;
root['repost_users'] = [];
root['all_users'] = [];
/*
VK.Api.call('wall.get', {test_mode: 1}, function(e) {
	alert(e.response);
mainData = e.response;
mainData.forEach(
function(e) {});



});
*/
VK.Api.call('likes.getList', {
		type: 'post',
		owner_id: postOwner, 
		item_id: postId,
		test_mode: 1
	    }, function(r) {
		root['root_likes_count'] = r.response['count'];
		root['all_users'] = r.response['users'];
		var users = r.response['users'];
		var index = 0;
		var t = setInterval(
		    function() 
		    {
			console.log(users[index]);
			if (users[index] == undefined) {
			    console.log(index + ' user fetched');
			    clearInterval(t);
			    localStorage.setItem(postOwner + '_' + postId, JSON.stringify(root));
			    return;
			}
			VK.Api.call('wall.get', { 
					owner_id: users[index],
					test_mode: 1
				    }, function(e) { 
					mainData = e.response;
					if (e.response == undefined)
					    return;
					mainData.forEach(
					    function(e)
					    { 
						if (e['copy_owner_id'] == postOwner)
						    root['repost_users'].push(e);
						    console.log(e); 
					    });
				    });
			index++;
		    }, 2000);
	    });
