function kickStart (adataset) {

var dataset = adataset;

var currVertex = 4;

d3.json(dataset, function(err, data){

  if (err) console.log("error getting data");
  
  var nodeList = [];
  
  //need to determine the size of grid based on num nodes
  numNodes = data.length; //ASSUMPTION THAT N AT LEAST 3
  
  gridWidth = (2 * numNodes) - 4; 
  gridHeight = numNodes - 2;

  const graphypoo = d3.select('#graphy-poo');
  const controlpanel = d3.select('#controlPanel');

  MakeAndInitFirstThreeNodes(nodeList);
 

  makeControlPanel(controlpanel);
  makeGraph(graphypoo);

  function runAlg(nList){
    for (k = 4; k <= numNodes; k++) {
	insertNode(k); //this may not belong here
    }
    accumulateOffsets(nodeList[0],0);

  } 
  
  function MakeAndInitFirstThreeNodes(nList) {
    node1 = new aNode(1);
    node2 = new aNode(2);
    node3 = new aNode(3);

    //add them to the list
    nList.push(node1);
    nList.push(node2);
    nList.push(node3);

    node1.id = data[0].id;
    node2.id = data[1].id;
    node3.id = data[2].id;

    //initialize the 3 nodes
    initNode(node1, 0, 0, node3, null, 0);
    initNode(node2, 1, 0, null, null, 1);
    initNode(node3, 1, 1, node2, null, 1);

    setNeighbors(node1, node1.id);
    setNeighbors(node2, node2.id);
    setNeighbors(node3, node3.id);
  }

  function initNode(theNode, dx, y, rc, lc, x) {
    theNode.ycoord = y;
    theNode.deltax = dx; //this should be offset from parent
    theNode.rightChild = rc;
    theNode.leftChild = lc;
    theNode.x = x;
  }
 
  function setNeighbors(theNode, id) {
    numNeighbors = data[id - 1].neighbors.length;
    for (i = 0; i < numNeighbors; i++) {
      theNode.neighbors.push(data[id - 1].neighbors[i].id);
    }
  }

  function aNode(id) {
    this.id = id;
    this.x = null;
    this.ycoord = null;
    this.deltax = null;
    this.rightChild = null;  
    this.leftChild = null; 
    this.neighbors = []; 
    return this;
  }

  //takes the id of the node to insert
  function insertNode(id) {
    newNode = new aNode(id);
    setNeighbors(newNode, newNode.id);

    //get the corresponding W's
    ws = getWs(nodeList[0], []).reverse();

    //get p
    var p;
    for (i = 0; i < ws.length; i++) {
      if(newNode.neighbors.includes(ws[i].id)) {
        p = i + 1; //p is paper index, so wp is located at ws[p-1]
  	break;
      }
    } 
    //get q
    var q;
    for (i = 0; i < ws.length; i++) {
      if(newNode.neighbors.includes(ws[i].id)) {
	 q = i + 1;
      }
    }
    //next "stretch gaps"
    ws[p].deltax = ws[p].deltax + 1;
    ws[q-1].deltax = ws[q-1].deltax + 1;

    //"adjust offsets"
    deltaxpq = 0;
    for ( i = p; i < q; i++) {
      deltaxpq = deltaxpq + ws[i].deltax;
    }

    //set position of new node
    newNode.deltax = (1/2) * (-(ws[p-1].ycoord) + deltaxpq + ws[q-1].ycoord);
    newNode.ycoord = (1/2) * (ws[p-1].ycoord + deltaxpq + ws[q-1].ycoord);
    ws[q-1].deltax = deltaxpq - newNode.deltax;

    if (p + 1 != q){
      ws[p].deltax = ws[p].deltax - newNode.deltax;
    }
    ws[p-1].rightChild = newNode;
    newNode.rightChild = ws[q-1];

    if (p + 1 != q) {
      newNode.leftChild = ws[p];
      ws[q-2].rightChild = null;
    }
    else {
      newNode.leftChild = null;
    }

    nodeList.push(newNode);
  }
 
  function accumulateOffsets(v, acc) {
    if (v != null) {
      v.x = v.deltax + acc;
      //v.deltax = v.deltax + acc;
      accumulateOffsets(v.leftChild, v.x);
      accumulateOffsets(v.rightChild, v.x);  
    }
  }

  function getWs(aNode, wList) {
    if(aNode == null) {
      return wList;
    }
    getWs(aNode.rightChild, wList);
    wList.push(aNode);
    return wList;
  }

  function makeControlPanel(parent) {
    const panelsvg = parent.select('svg');

    //next i really need to decide which graphs I want to offer
    theGraphs = ['fournode.json', 'kfour.json', 
		  'pent2.json', 'six.json', 'ninenode.json', 'papergraph.json'];
    displayNames = ['4-node', 'K4', '5-node', '6-node', '9-node', '11-node'];

    const graphbutts = panelsvg.append('g');

    for (i = 0; i < theGraphs.length; i++) {
      if (i < 3) {
	abutton = graphbutts.append('g');
        abutton.append('rect')
	  .attr("x", 100)
	  .attr("y", i * 60)
	  .attr("width", 100)
	  .attr("height", 40)
	  .attr("fill", "teal");
	abutton.append('text')
	  .attr("x", 150)
	  .attr("y", i * 60 + 28)
	  .style("text-anchor", "middle")
	  .text(displayNames[i])
	  .attr("fill", "white")
	  .attr("font-size", 15)
	  .on("click", clickGraph);
      }
      else {
	abutton = graphbutts.append('g');
        abutton.append('rect')
	  .attr("x", 220)
	  .attr("y", (i - 3) * 60)
	  .attr("width", 100)
	  .attr("height", 40)
	  .attr("fill", "teal");
	abutton.append('text')
	  .attr("x", 270)
	  .attr("y", (i - 3) * 60 + 28)
	  .style("text-anchor", "middle")
	  .text(displayNames[i])
	  .attr("fill", "white")
	  .attr("font-size", 15)
	  .on("click", clickGraph);
      }      
    }
  }
  function clickGraph() {
    thetext = d3.select(this).text();
    var newdataset
    if (thetext == "4-node") {
	newdataset = "quad2.json";
    } else if (thetext == "K4") {
	newdataset = "quad.json";
    } else if (thetext == "6-node") {
	newdataset = "six.json";
    } else if (thetext == "9-node") {
	newdataset = "ninenode.json";
    } else if (thetext == "11-node") {
	newdataset = "papergraph.json";
    } else if (thetext == "5-node") {
	newdataset = "pent2.json";
    }
    thesvg = graphypoo.select('svg');
    cpsvg = controlpanel.select('svg');
    thesvg.selectAll("*").remove();
    cpsvg.selectAll("*").remove();
    kickStart(newdataset);
  }

  function makeGraph(parent) {
  
    const mysvg = parent.select('svg');
 
    graphsvgheight = parseInt(mysvg.style("height"));
   
    const spacing = graphsvgheight/gridWidth; 
    const rad = spacing/4;
    const fontsize = spacing/3;
    //const spacing = 20;

    margin = {top: rad, right: rad, bottom: rad, left: rad};

    const grid = mysvg.append('g')
      .attr('class', 'grid');
    const horiz = grid.append('g')
      .attr('class', 'horiz');
    const vertical = grid.append('g')
      .attr('class', 'vertical');
      
    //first let's build the grid
    for (i = 0; i <= gridWidth; i++) {
      if (i <= gridHeight) {
        horiz.append('line')
          .attr("x1", 0)
          .attr("y1", i * spacing + margin.top)
          .attr("x2", (gridWidth+ 1) * spacing - 2 * margin.left)
          .attr("y2", i * spacing + margin.top)
	  .attr("stroke-width", 1)
	  .attr("stroke", "#bac8e0");
      }
      vertical.append('line')
	.attr("x1", i * spacing + margin.left)
        .attr("y1", 0)
	.attr("x2", i * spacing + margin.left)
	.attr("y2", (gridHeight) * spacing + (2 * margin.top))
	.attr("stroke-width", 1)
	.attr("stroke", "#bac8e0");
      
    }

    //make the edges
    const edges = mysvg.append('g')
      .attr('class', 'edges'); 

    myedges = [];
    for (i = 0; i < nodeList.length; i++) {
      for (j = 0; j < nodeList[i].neighbors.length; j++) {
	if (nodeList[i].neighbors[j] in nodeList) {
	  myedges.push([nodeList[i].id, nodeList[i].neighbors[j]]);
        }
      }
    }

    edges.selectAll("line")
      .data(myedges)
      .enter()
      .append('line')
      .attr("x1", function(d) {return (nodeList[d[0] - 1].x) * spacing + margin.left;})
      .attr("y1", function(d) {return (nodeList[d[0] - 1].ycoord) * spacing + margin.top;})
      .attr("x2", function(d) {return (nodeList[d[1] - 1].x) * spacing + margin.left;})
      .attr("y2", function(d) {return (nodeList[d[1] - 1].ycoord) * spacing + margin.top;})
      .attr("stroke-width", 2)
      .attr("stroke", "black");
  
 
    //overlay the vertices
    const vertices = mysvg.append('g')
      .attr('class', 'vertices');

    vertices.selectAll("circle")
      .data(nodeList)
      .enter()
      .append('circle')
      .attr("cx", function(d) { return (nodeList[d.id - 1].x) * spacing + margin.left;})
      .attr("cy", function(d) { return (nodeList[d.id - 1].ycoord) * spacing + margin.top;})
      .attr("r", rad)
      .attr("fill", "teal");
 
    //let's get some labels on there
    vertices.selectAll("text")
      .data(nodeList)
      .enter()
      .append('text')
      .text(function(d) { return d.id;})
      .attr("x", function(d) {return nodeList[d.id - 1].x * spacing + margin.left;})
      .attr("y", function(d) {return nodeList[d.id - 1].ycoord * spacing + margin.top + rad/2;})
      .attr("text-anchor", "middle")
      .attr("font-size", fontsize)
      .attr("fill", "white");

    //we need to have an add vertex button
    const addvbutton = mysvg.append('g')
      			.attr('class', 'addvbutton')
			.on("click", runRound); 

 
    buttonx = (spacing * gridWidth)/ 2 - 50 + margin.left;
    buttony = (spacing * (gridHeight + 1));

    addvbutton.append("rect")
      .attr("x", buttonx)
      .attr("y", buttony)
      .attr("width", 100)
      .attr("height", 40)
      .attr("fill", "teal");
    addvbutton.append("text")
      .attr("x", buttonx + 12)
      .attr("y", buttony + 25)
      .attr("fill", "white")
      .text("add vertex");

    function runRound(){
        insertNode(currVertex);
	accumulateOffsets(nodeList[0],0);
	mysvg.selectAll("*").remove();
  	makeGraph(graphypoo);
  	currVertex = currVertex + 1;
   }
  }


});
}
kickStart('triangle.json');


