VK.Widgets.Auth("vk_auth", {
		    width: "200px", 
		    onAuth: function(data) {
		    }
		});

VK.Api.call('likes.getList', {
		type: 'post',
		item_id: '145',
		test_mode: 1
       }, function(r) {
	   alert(r.response['users'][0]);

	   VK.Api.call('wall.get', { 
			   owner_id: r.response['users'][0],
			   test_mode: 1
		       }, function(r) { alert(r.rsponse['count']); });
       });