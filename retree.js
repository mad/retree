VK.Widgets.Auth("vk_auth", {
		    width: "200px", 
		    onAuth: function(data) {
			alert(data['session']);
		    }
		});

VK.Api.call('likes.getList', {
		type: 'post',
		owner_id:'129042184',
		item_id: '317',
		test_mode: 1
       }, function(r) {alert(r.response['count']);});
       
