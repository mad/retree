VK.Widgets.Auth("vk_auth", {
		    width: "200px", 
		    onAuth: function(data) {
			alert(data['session']);
		    }
		});

VK.Api.call('likes.getList', {
		type: 'post',
		item_id: '145',
		test_mode: 1
       }, function(r) {
	   alert(r.response['count']);
       });