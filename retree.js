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

function getTree(ownerID, postID, level)
{
    VK.Api.call('likes.getList', {
		    type: 'post',
		    owner_id: ownerID,
		    item_id: postID,
		    test_mode: 1
		}, function(r) {
		    // root['root_likes_count'] = r.response['count'];
		    // root['all_users'] = r.response['users'];
		    var users = r.response['users'];
		    var index = 0;
		    console.log("Users: " + r.response['count']);
		    var t = setInterval(
			function()
			{
			    if (users[index] == undefined) {
				console.log(index + ' user fetched');
				clearInterval(t);
				update();
				localStorage.setItem(root['root_owner_id'] + '_' + root['root_post_id'], JSON.stringify(root));
				return;
			    }
			    VK.Api.call('wall.get', {
					    owner_id: users[index],
					    test_mode: 1
					}, function(msgs) {
					    mainData = msgs.response;
					    if (msgs.response == undefined)
						return;
					    mainData.forEach(
						function(msg)
						{
						    if (msg['copy_owner_id'] == root['root_owner_id']
							&& msg['copy_post_id'] == root['root_post_id'])
						    {
							// var idx = users.indexOf(e['copy_owner_id']);
							// if (idx != -1)
							//     users.splice(idx, 1);

							root['repost_users'].push({ level: level, data: msg, parent: ownerID});

							level++;
							setTimeout(getTree(msg['from_id'], msg['id'], level), 500);
						    }
						});
					});
			    index++;
			}, 500);
		});
}

getTree(postOwner, postId, 0);

var w = 960,
    h = 500,
    rootTree = {},
    data = [rootTree],
    tree = d3.layout.tree().size([w - 20, h - 20]),
    diagonal = d3.svg.diagonal(),
    duration = 750
//    timer = setInterval(update, duration);

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(10, 10)");

vis.selectAll("circle")
    .data(tree(rootTree))
  .enter().append("svg:circle")
    .attr("class", "node")
    .attr("r", 3.5)
    .attr("cx", x)
    .attr("cy", y);

function update() {
  if (data.length >= 500) return clearInterval(timer);

  // Add a new datum to a random parent.
    if (root['repost_users'].length == 0)
	return;

    // var d = {id: root['repost_users'][root['repost_users'].length - 1]['data']['from_id'] },
    // parent = root['repost_users'][root['repost_users'].length - 1]['parent'];

    // if (parent.children) parent.children.push(d); else parent.children = [d];
    // data.push(d);

  var d = {id: root['repost_users'][root['repost_users'].length - 1]['data']['from_id'] },
    parent = root['repost_users'][root['repost_users'].length - 1]['data']['copy_owner_id'];

  if (parent.children) parent.children.push(d); else parent.children = [d];
  data.push(d);

  // Compute the new tree layout. We'll stash the old layout in the data.
  var nodes = tree.nodes(rootTree);

  // Update the nodes…
  var node = vis.selectAll("circle.node")
      .data(nodes, function(d) { return d.id; });

  // Enter any new nodes at the parent's previous position.
  node.enter().append("svg:circle")
      .attr("class", "node")
      .attr("r", 3.5)
      .attr("cx", function(d) { return d.parent.x0; })
      .attr("cy", function(d) { return d.parent.y0; })
    .transition()
      .duration(duration)
      .attr("cx", x)
      .attr("cy", y);

  // Transition nodes to their new position.
  node.transition()
      .duration(duration)
      .attr("cx", x)
      .attr("cy", y);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "circle")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: d.source.x0, y: d.source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);
}

function x(d) {
  return d.x0 = d.x;
}

function y(d) {
  return d.y0 = d.y;
}
