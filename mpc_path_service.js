var three = require('three');

// Determine virtual square centers (scale of 0 [leftmost side of playing surface] to 1 [rightmost side])
// x = 0; left edge of A1 square
// y = 0; bototm edge of A1 square
// z = 0; height of the playing surface

// Optional, pass in buffer as a percentage of board square
var buffer = 0;

var squareLength = 1/8;
var a1SquareCenter = new three.Vector3(squareLength/2, squareLength/2, 0);
var fileMap = ['a','b','c','d','e','f','g','h'];
var offBoardMap = ['z', 'y', 'i', 'j']
var centers = [];
var validSpaces = [];

exports.handler = function (event, context, callback) {

  if(event.params.querystring.hasOwnProperty("from")) {

    var from = event.params.querystring.from.toLowerCase();
    var to = "";

    if(event.params.querystring.hasOwnProperty("to") && event.params.querystring.to) {
      to = event.params.querystring.to.toLowerCase();
    }

    // Should be passed in as a % of board square
    if(event.params.querystring.hasOwnProperty("buffer") && event.params.querystring.buffer) {
      buffer = event.params.querystring.buffer.toLowerCase();
    }

    // Build out center positions for board squares
    for(var rank=0;rank<8;rank++) {
      for(var file=0;file<8;file++) {
        c = new three.Vector3(a1SquareCenter.x+squareLength*file, a1SquareCenter.y+squareLength*rank, a1SquareCenter.z);
        centers[fileMap[file]+(rank+1)] = c;
        validSpaces.push(fileMap[file] + (rank+1));
      }
    }

    // Build out center positions for off-board squares
    for(var rank=0;rank<4;rank++) {
      for(var file=0;file<4;file++) {
        xoffset = (buffer + squareLength*(8+file-1))
        if(file < 2) {
          // for y and z
          xoffset = -1*(buffer+squareLength*(file+1));
        }
        c = new three.Vector3(a1SquareCenter.x+xoffset, a1SquareCenter.y+squareLength*rank, a1SquareCenter.z);
        centers[offBoardMap[file]+(rank+1)] = c;
        validSpaces.push(offBoardMap[file] + (rank+1));
      }
    }    
    console.log(centers);

    // Check that 'from' and 'to' parameters are valid
    if(validSpaces.indexOf(from) < 0) {
      console.log("Invalid 'from' parameter'");
      callback("Invalid 'from' parameter'");
    }
    if(validSpaces.indexOf(to) < 0 && to !== "") {
      console.log("Invalid 'to' parameter'");
      callback("Invalid 'to' parameter'");
    } else if (to === from) {
      console.log("Parameters 'from' and 'to' cannot be equal");
      callback("Parameters 'from' and 'to' cannot be equal");      
    } else if (to === "") {
      to = "offboard";
    }

    // Add center for off-board location
    centers['offboard'] = new three.Vector3(-1, -1, 0);

    // Calculate and return steps
    steps = calcSteps(centers[from], centers[to]);
    callback(null, { "steps": steps });

  } else {
    console.log("Missing 'from' parameter'");
    callback("Missing 'from' parameter'");    
  }
}


// Takes in two 3d vectors and calculates the moves to complete
function calcSteps(from, to) {
  
  // Square movement
  current = from.clone();
  up = new three.Vector3(0, 0, 1);
  down = new three.Vector3(0, 0, -1);

  var steps = [];
  steps.push(current.add(up).toArray());
  steps.push(current.add(down).toArray());
  steps.push('close');
  steps.push(current.add(up).toArray());

  if(to) {
    current = to.clone();
    steps.push(current.add(up).toArray());
    steps.push(current.add(down).toArray());
    steps.push('open');
  } else {
    // If end position no defined, move off of board
    current = centers['offboard'].clone();
    steps.push(current.add(up).toArray());
    steps.push(current.add(down).toArray());
    steps.push('open');
  }

  // Move up and back to home position
  steps.push(current.add(up).toArray());
  current = a1SquareCenter.clone();
  steps.push(current.add(up).toArray());

  return steps;
}