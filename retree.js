VK.Widgets.Auth("vk_auth", {
    width: "200px",
    onAuth: function(data) {
    }
});

// 1000 likes
var root_owner_id = 66749591;
var root_item_id = 5796;

var root = {};
root.owner_id = root_owner_id;
root.item_id = root_item_id;
root.data = undefined;
root.childs = [];
var photo="";
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

var fetched_users = [];

function getTree(root_node, parent)
{
    console.log("Fetching data from "
                + root_node.owner_id + "_" + root_node.item_id);

    if (fetched_users.indexOf(root_node.owner_id) != -1) {
        console.log("This user already fetched " + root_node.owner_id);
        return;
    }

    fetched_users.push(root_node.owner_id);

    VK.Api.call('likes.getList', {
        type: 'post',
        owner_id: root_node.owner_id,
        item_id: root_node.item_id,
        count: 1000,
        test_mode: 1
    }, function(like_list) {
        if (like_list.error) {
            console.log("likes.getList error: " + like_list.error.error_msg);
            return;
        }

        var users = like_list.response.users;
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

                if (users[index] == root_node.owner_id) {
                    index++;
                    console.log("It is same user, skip it " + root_node.owner_id);
                    return;
                }

                VK.Api.call('wall.get', {
                    owner_id: users[index],
                    test_mode: 1
                }, function(wall) {
                    if (wall.error) {
                        console.log("wall.get error: " + wall.error.error_msg);
                        return;
                    }

                    if (wall.response[0] == 0) {
                        console.log("0 messages returned");
                        return;
                    }

                    console.log("Fetching " + wall.response[0] + " msg, from " + wall.response[1].from_id);

                    wall.response.forEach(
                        function(msg)
                        {
                            if (msg.copy_owner_id == root_owner_id
                                && msg.copy_post_id == root_item_id)
                            {
                                var child = {};

                                child.owner_id = msg.from_id;
                                child.item_id = msg.id;
                                child.data = msg;
                                //child.picture = msg;
                                child.childs = [];
  
	   VK.Api.call('getProfiles', {
                    uids:   child.owner_id,
                    fields:"photo",
                    test_mode: 1
                }, function(profile_list) {
 child.picture = profile_list.response[0].photo;
 console.log(child.picture);
                    }
				);


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

function plot()
{
    var r = 1600 / 2;

    var tree = d3.layout.tree()
        .size([360, r - 120])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / 3; })
        .children(function(d) {
            if (d.childs.length == 0)
                return null;
            else
                return d.childs;});

    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    var vis = d3.select("body").append("svg:svg")
        .attr("width", r * 2)
        .attr("height", r * 2 - 150)
        .append("svg:g")
        .attr("transform", "translate(" + r + "," + r + ")");

    function treemap(json) {
		
	
		
		
        var nodes = tree.nodes(json);

        var link = vis.selectAll("path.link")
            .data(tree.links(nodes))
            .enter().append("svg:path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = vis.selectAll("g.node")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

        node.append("svg:circle")
            .attr("r", 4.5)
            .append("svg:a");
 node.append("svg:image")
        .attr("class", "circle")
        .attr("xlink:href", function(d) { return d.photo; })
        .attr("x", "-8px")
        .attr("y", "-8px")
        .attr("width", "16px")
        .attr("height", "16px");
        node.append("svg:a")
            .attr("xlink:href", function(d) { return "http://vkontakte.ru/id" + d.owner_id; })
            .append("svg:text")
            .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
            .attr("dy", ".31em")
            .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
            .text(function(d) { return d.owner_id; });
    }

    treemap(root);
}
