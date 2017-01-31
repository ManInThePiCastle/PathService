# Man in the Pi Castle - Path Service

## Purpose
Take a move in *Coordinate Notation* and translate that into a series of moves/actions in 3d space in order to achieve that move.

## API Documentation
TBD

## To run locally
`nodejs -e 'require("./mpc_path_service").handler({ params: { querystring: { from: "a1", to: "b2" } } },{},function(message) { console.log(message); })'