VK.Widgets.Auth("vk_auth", {
    width: "200px",
    onAuth: function(data) {
    }
});

var root_owner_id = 66749591;
var root_item_id = 5796;

var root = {};
root.owner_id = root_owner_id;
root.item_id = root_item_id;
root.data = undefined;
root.childs = [];

// Get info about this like
VK.Api.call('wall.getById', {
    posts: root.owner_id + "_" + root.item_id,
    test_mode: 1

}, function(r) {
    if (r.error) {
	console.log("wall.getById error: " + r.error.error_msg);
	return;
    }

    root.data = r.response[0];
});

function getTree(root_node, parent)
{
    console.log("Fetching data from "
		+ root_node.owner_id + "_" + root_node.item_id);

    VK.Api.call('likes.getList', {
        type: 'post',
        owner_id: root_node.owner_id,
        item_id: root_node.item_id,
	count: 1000,
        test_mode: 1
    }, function(r) {

	if (r.error) {
	    console.log("likes.getList error: " + r.error.error_msg);
	    return;
	}

        var users = r.response.users;
        var index = 0;

        // Iterate for all users which like it and wait
        // .5s and get user whall
        var t = setInterval(
            function()
            {
                if (users[index] === undefined) {
                    clearInterval(t);
		    console.log("Fetched " + index + " users, " + t + " canceled");
		    // localStorage.setItem(root.owner_id + '_' + root.item_id,
		    //                      JSON.stringify(root));
                    return;
                }

                VK.Api.call('wall.get', {
                    owner_id: users[index],
		    filter: owner,
                    test_mode: 1
                }, function(r) {
		    if (r.error) {
			console.log("wall.get error: " + r.error.error_msg);
			return;
		    }

		    console.log("Fetching " + r.response[0] + " msg, from " + r.response[1].from_id);

                    r.response.forEach(
                        function(r)
                        {
                            if (r.copy_owner_id == root_owner_id
                                && r.copy_post_id == root_item_id)
                            {
				var child = {};

				child.owner_id = r.from_id;
				child.item_id = r.id;
				child.data = r;
				child.childs = [];

				console.log("Parent has " + parent.length + " childs");

				if (parent !== undefined)
                                    parent.push(child);

                                setTimeout(getTree(child, child.childs), 1000);
                            }
                        });
                });
                index++;
            }, 1000);
    });
}

getTree(root, root.childs);

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


var w = 960,
h = 500,
r = d3.scale.sqrt().domain([0, 20000]).range([0, 20]);

var force = d3.layout.force()
    .gravity(.01)
    .charge(-120)
    .linkDistance(60)
    .size([w, h]);

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);


function update() {

    if (data.length >= 500) return clearInterval(timer);

    // Add a new datum to a random parent.
    // if (root['repost_users'].length == 0)
    //  return;

    // data = [];
    // root['repost_users'].forEach(
    //  function(e) {
    //      data.push(e['parent']);
    //      data.push(e['data']['from_id']);
    //      data.push[data.length - 1].parent = e['parent'];
    //  });

    // var d = {id: root['repost_users'][root['repost_users'].length - 1]['data']['from_id']},
    // parent = root['repost_users'][root['repost_users'].length - 1]['parent'];

    var d = {id: data.length}, parent = data[~~(Math.random() * data.length)];

    if (parent.children)
        parent.children.push(d);
    else
        parent.children = [d];
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
