// Hey, why didn't I do this in svg?

// UI Components
var board_view, // the board with marks
    overlay, // the 'which square to play in'
    meta, // the 3x3 'supergrid'
    canvas_div;

// UI Parameters
var gutter = 4, // distance from the outer edge of the canvas to the grid lines
    small_gutter = 0, // I don't know what this was
    big_width = 5, // Width of the thicker grid lines
    small_width = 2; // Width of the thinner grid lines

// left edge of each square in the 9x9 board, without taking into
// account secondary gutters. Basically, click bounding boxes.
var x_cuts = [];
// top edge
var y_cuts = [];

// Logical
var moves = [];
var board_state_all = new Array(81), // true if mark in square
    board_state_x = new Array(81), // true if x in square
    board_state_o = new Array(81); // true of o in square

var master_board_all = new Array(9), // true if a square in 'supergrid' completed
    master_board_x = new Array(9), // true if x won a 'supergrid'
    master_board_o = new Array(9); // true of o won a 'supergrid'

var aiWorker = new Worker("ai.js");

function handle_ai_message(event) {
  console.log(event.data);
  make_move(event.data[0], event.data[1]);
}

// Initialize the whole thing. Reset the logicals, draw the whole board.
function initialize() {
  board_view = document.getElementById("board");
  overlay = document.getElementById("overlay");
  meta = document.getElementById("meta");
  canvas_div = document.getElementById("canvases");

  window.addEventListener('resize', resize_all, false);

  resize_all();
  reset_game();
  redraw_board();
  redraw_state();
}

function reset_game() {
  xTurn = true;
  moves = new Array(0);
  board_state_all = new Array(81);
  board_state_x = new Array(81);
  board_state_o = new Array(81);
  master_board_all = new Array(9);
  master_board_x = new Array(9);
  master_board_o = new Array(9);
  aiWorker.terminate();
  aiWorker = new Worker("ai.js");
  aiWorker.onmessage = handle_ai_message;
}

// Clear the overlays, redraw the board grid.
function redraw_board() {
  clear_overlay();
  clear_meta();
  draw_board();
}

// Redraw the x's, o's, and meta-grid
function redraw_state() {
  for(x=0;x<9;x++) {
    for(y=0;y<9;y++) {
      if(board_state_x[xy_to_1d(x,y)]) {
        drawX(x,y);
      } else if(board_state_o[xy_to_1d(x,y)]) {
        drawO(x,y);
      }
    }
  }

  if( moves.length > 0) {
    overlay_x = moves[moves.length-1][0] % 3;
    overlay_y = moves[moves.length-1][1] % 3;

    if(xTurn) {
      highlight_grid(overlay_x,overlay_y, '#03f');
    } else {
      highlight_grid(overlay_x,overlay_y, '#f30');
    }
  }
}

function resize_all() {
  best_height = window.innerHeight;
  best_width = window.innerWidth;
  size = Math.min(best_height, best_width) - 15;
  if(best_height < best_width) {
    size -= 35; // space for the controls
  }
  console.log(size);
  canvas_div.style.width = (size + 5) + "px";
  canvas_div.style.height = size + "px";
  board_view.width = size;
  board_view.height = size;
  overlay.width = size;
  overlay.height = size;
  meta.height = size;
  meta.width = size;
  redraw_board();
  redraw_state();
}

// Populate the variables that store the bounding boxes for the grids
function calculate_edges( width, height ) {

  // take the whole canvas, subtract the gutters, divide by three,
  // then shift left by the gutter width. This is the distance from
  // a primary edge to the center of the 'third line'
  big_third = ( width - 2 * gutter ) / 3 + gutter;

  // distance from the edge of a big square (to the center of the smaller
  // 'third line'
  little_third = ( ( big_third - gutter ) - ( big_width / 2 ) - ( 2 * small_gutter ) ) / 3 + small_gutter;
  x_cuts[0] = gutter;

  x_cuts[1] = gutter + little_third;
  x_cuts[2] = big_third - ( big_width / 2 ) - little_third;

  x_cuts[3] = big_third;

  x_cuts[4] = big_third + ( big_width / 2 ) + little_third;
  x_cuts[5] = width - big_third - ( big_width / 2 ) - little_third;

  x_cuts[6] = width - big_third;

  x_cuts[7] = x_cuts[6] + ( big_width / 2 ) + little_third;
  x_cuts[8] = width - gutter - little_third;

  x_cuts[9] = width - gutter;

  //////////
  big_third = ( height - 2 * gutter ) / 3 + gutter;
  little_third = ( ( big_third - gutter ) - ( big_width / 2 ) - ( 2 * small_gutter ) ) / 3 + small_gutter;

  y_cuts[0] = gutter;

  y_cuts[1] = gutter + little_third;
  y_cuts[2] = big_third - ( big_width / 2 ) - little_third;

  y_cuts[3] = big_third;

  y_cuts[4] = big_third + ( big_width / 2 ) + little_third;
  y_cuts[5] = height - big_third - ( big_width / 2 ) - little_third;

  y_cuts[6] = height - big_third;

  y_cuts[7] = y_cuts[6] + ( big_width / 2 ) + little_third;
  y_cuts[8] = height - gutter - little_third;
  y_cuts[9] = height - gutter;

  console.log(x_cuts);
  console.log(y_cuts);
}

// Clear the board that shows where to move next
function clear_overlay() {
  context = overlay.getContext("2d");
  context.beginPath();
  context.clearRect(0,0,overlay.width,overlay.height);
  context.stroke();
  context.closePath();
}

// Clear the board that marks suprgrid squares
function clear_meta() {
  context = meta.getContext("2d");
  context.beginPath();
  context.clearRect(0,0,overlay.width,overlay.height);
  context.stroke();
  context.closePath();
}

function draw_board() {
  width = board_view.width;
  height = board_view.height;

  calculate_edges( width, height );

  context = board_view.getContext("2d");
  // draw box
  context.beginPath();
  context.strokeStyle = "#000";
  context.clearRect(0,0,width,height);
  context.lineWidth = 1;
  context.rect(0,0,width,height);
  context.stroke();
  context.closePath();

  // Draw main board

  for(i = 1;i < 9;i++) {
    context.beginPath();
    if(i % 3 === 0) {
      context.lineWidth = big_width;
    } else {
      context.lineWidth = small_width;
    }
    context.moveTo( x_cuts[i], gutter );
    context.lineTo( x_cuts[i], height - gutter );
    context.moveTo( gutter, y_cuts[i] );
    context.lineTo( width - gutter, y_cuts[i] );
    context.stroke();
    context.closePath();
  }

}

var xTurn = true;

function click_handler( event ) {

  target = event.target || e.srcElement;
  rect = target.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;

  // figure out which box.
  x = 8;
  for( i = 1;i < 9;i++ ) {
    if(x_cuts[i] > offsetX) {
      x = i - 1;
      break;
    }
  }

  y = 8;
  for( i = 1;i < 9;i++ ) {
    if(y_cuts[i] > offsetY) {
      y = i - 1;
      break;
    }
  }

  if(!validate_move(x,y)) {
    return;
  }

  make_move( x, y );

  aiWorker.postMessage([x,y]);

}

function make_move( x, y ) {

  clear_overlay();
  overlay_grid_x = x % 3;
  overlay_grid_y = y % 3;

  // Turn-dependent updates
  if( xTurn ) {
    board_state_x[ xy_to_1d(x,y) ] = true;
    drawX( x, y );
    highlight_grid( overlay_grid_x, overlay_grid_y, "#f30");
  } else {
    board_state_o[ xy_to_1d(x,y) ] = true;
    drawO( x, y );
    highlight_grid( overlay_grid_x, overlay_grid_y, "#03f");
  }

//  shade_grid( assoc_grid_x, assoc_grid_y, "rgba(0,255,00,0.7)" )

  board_state_all[ xy_to_1d(x,y) ] = true;
  xTurn = !xTurn;

  move_count = moves.length;
  moves[length] = [x,y];

  won = check_for_wins( x, y );

  if(won != -1) {
    game_over(won);
  }

  cant_move = check_for_cant_move( x, y );
  if( cant_move ) {
    game_over(-1);
  }

  draw = check_for_draw( x, y );
  if(draw) {
    game_over(-1);
  }
}

function validate_move( x, y ) {
  if( moves.length === 0) {
    return true;
  }

  if(board_state_all[ xy_to_1d( x, y ) ]) {
    // Square is occupied
    return false;
  }

  last_x = moves[moves.length - 1][0];
  last_y = moves[moves.length - 1][1];

  x_grid = Math.floor( x / 3 );
  y_grid = Math.floor( y / 3 );

  last_x_relative = last_x % 3;
  last_y_relative = last_y % 3;

  if( last_x_relative != x_grid || last_y_relative != y_grid ) {
    return false;
  }

  return true;
}

// true false
function check_for_draw( x, y ) {
  return moves.length == 81;
}

// This has to be a draw, because it's forceable by
// player 1
function check_for_cant_move( x, y ) {
  root_x = (x % 3) * 3;
  root_y = (y % 3) * 3;

  squares = new Array(9);

  squares[0] = xy_to_1d(root_x,root_y);
  squares[1] = squares[0] + 1;
  squares[2] = squares[1] + 1;

  squares[3] = squares[0] + 9;
  squares[4] = squares[3] + 1;
  squares[5] = squares[4] + 1;

  squares[6] = squares[3] + 9;
  squares[7] = squares[6] + 1;
  squares[8] = squares[7] + 1;

  for( i = 0;i < 9;i++) {
    if(!board_state_all[squares[i]]) {
      return false;
    }
  }

  return true;
}

// Checks for subgrid wins and supergrid wins.
// -1 = no win
// 0 = x win
// 1 = o win
// x, y coord of move
function check_for_wins( x, y ) {
  // The subgrid we're in
  x_grid = Math.floor( x / 3 );
  y_grid = Math.floor( y / 3 );
  // If this subgrid is already in a state, we don't need to do anything
  if( master_board_all[ x_grid + y_grid * 3] ) {
    return -1; // no change
  }

  // The upper left corner of our subgrid.
  root_x = x_grid * 3;
  root_y = y_grid * 3;

  squares = new Array(9);

  squares[0] = xy_to_1d(root_x,root_y);
  squares[1] = squares[0] + 1;
  squares[2] = squares[1] + 1;

  squares[3] = squares[0] + 9;
  squares[4] = squares[3] + 1;
  squares[5] = squares[4] + 1;

  squares[6] = squares[3] + 9;
  squares[7] = squares[6] + 1;
  squares[8] = squares[7] + 1;

  sub_result = check_subgrid_winner( squares );

  if( sub_result == -1 ) {
    return -1; // if a sub board wasn't won this turn, the whole game can't be won
  }

  // update master grid
  master_board_all[ x_grid + y_grid * 3] = true;
  if( sub_result === 0 ) {
    master_board_x[ x_grid + y_grid * 3] = true;
    shade_grid( x_grid, y_grid, "rgba(0, 0, 255, 0.5)");
  } else {
    master_board_o[ x_grid + y_grid * 3] = true;
    shade_grid( x_grid, y_grid, "rgba(255, 0, 0, 0.5)");
  }

  // check for win
  return check_master_winner();

}

// see if there is a win on the master board.
// -1, 0 1 for no, x, and o wins
function check_master_winner() {
  // check horizontal
  for( i = 0;i < 9;i+=3 ) {
    if ( master_board_x[i] && master_board_x[i+1] && master_board_x[i+2] ) {
      return 0;
    }
    if ( master_board_o[i] && master_board_o[i+1]  && master_board_o[i+2]) {
      return 1;
    }
  }

  // check vertical
  for(i = 0;i < 3;i++) {
    if ( master_board_x[i] && master_board_x[i+3]  && board_state_x[i+6]) {
      return 0;
    }
    if ( master_board_o[i] && master_board_o[i+3]  && master_board_o[i+6]) {
      return 1;
    }
  }

  // check diagonal \
  if( master_board_x[0] && master_board_x[4] && master_board_x[8] ) {
    return 0;
  }
  if ( master_board_o[0] && master_board_o[4] && master_board_o[8] ) {
    return 1;
  }

  // check diagonal /
  if( master_board_x[2] && master_board_x[4] && master_board_x[6] ) {
    return 0;
  }
  if( master_board_o[2] && master_board_y[4] && master_board_o[6] ) {
    return 1;
  }

  // No wins
  return -1;
}

// Given a set of 1d coordinated squares (0-80 style) from a single subgrid, is there a winner
// -1, 0, 1 for no, x, and o wins.
function check_subgrid_winner( squares ) {
  // check horizontal
  for( i = 0;i < 9;i+=3 ) {
    if ( board_state_x[squares[i]] && board_state_x[squares[i+1]]  && board_state_x[squares[i+2]]) {
      return 0;
    }
    if ( board_state_o[squares[i]] && board_state_o[squares[i+1]]  && board_state_o[squares[i+2]]) {
      return 1;
    }
  }

  // check vertical
  for(i = 0;i < 3;i++) {
    if ( board_state_x[squares[i]] && board_state_x[squares[i+3]]  && board_state_x[squares[i+6]]) {
      return 0;
    }
    if ( board_state_o[squares[i]] && board_state_o[squares[i+3]]  && board_state_o[squares[i+6]]) {
      return 1;
    }
  }

  // check diagonal \
  if( board_state_x[squares[0]] && board_state_x[squares[4]] && board_state_x[squares[8]] ) {
    return 0;
  }
  if ( board_state_o[squares[0]] && board_state_o[squares[4]] && board_state_o[squares[8]] ) {
    return 1;
  }

  // check diagonal /
  if( board_state_x[squares[2]] && board_state_x[squares[4]] && board_state_x[squares[6]] ) {
    return 0;
  }
  if( board_state_o[squares[2]] && board_state_o[squares[4]] && board_state_o[squares[6]] ) {
    return 1;
  }

  // No wins
  return -1;
}

function drawX( x, y ) {
  context = board_view.getContext("2d");

  width = x_cuts[x+1]-x_cuts[x];
  height = y_cuts[y+1]-y_cuts[y];

  offset_x = width * 0.15;
  offset_y = height * 0.15;

  context.beginPath();
  context.strokeStyle = "#00f";
  context.lineWidth = small_width;
  context.moveTo( x_cuts[x] + offset_x, y_cuts[y] + offset_y );
  context.lineTo( x_cuts[x+1] - offset_x, y_cuts[y+1] - offset_y );
  context.moveTo( x_cuts[x+1] - offset_x, y_cuts[y] + offset_y );
  context.lineTo( x_cuts[x] + offset_x, y_cuts[y+1] - offset_y );
  context.stroke();
  context.closePath();
}

function drawO( x, y ) {
  context = board_view.getContext("2d");

  center_x = (x_cuts[x] + x_cuts[x+1]) / 2;
  center_y = (y_cuts[y] + y_cuts[y+1]) / 2;
  radius_x = ( x_cuts[x+1] - x_cuts[x] ) / 2 * 0.70;

  context.beginPath();
  context.strokeStyle = "#f00";
  context.lineWidth = small_width;
  context.arc(center_x, center_y, radius_x, 2 * Math.PI, 0, false );
  context.stroke();
  context.closePath();
}

// Highlight a subgrid on the overlay. (0,0) is the upper left subgrid.
function highlight_grid( x, y, color ) {
  x_cut_lower = x * 3;
  x_cut_upper = x_cut_lower + 3;
  y_cut_lower = y * 3;
  y_cut_upper = y_cut_lower + 3;

  context = overlay.getContext("2d");
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = big_width;
  context.rect( x_cuts[x_cut_lower], y_cuts[y_cut_lower],
                x_cuts[x_cut_upper] - x_cuts[x_cut_lower], y_cuts[y_cut_upper] - y_cuts[y_cut_lower] );
  context.stroke();
  context.closePath();
}

// Shade a subgrid on the meta
function shade_grid( x, y, color ) {
  x_cut_lower = x * 3;
  x_cut_upper = x_cut_lower + 3;
  y_cut_lower = y * 3;
  y_cut_upper = y_cut_lower + 3;

  context = meta.getContext("2d");
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 0;
  context.fillStyle = color;
  context.fillRect( x_cuts[x_cut_lower], y_cuts[y_cut_lower],
                    x_cuts[x_cut_upper] - x_cuts[x_cut_lower], y_cuts[y_cut_upper] - y_cuts[y_cut_lower] );
  context.stroke();
  context.closePath();
}

// Convert an x/y square on the 9x9 to a number 0-80 (0 = upper left)
function xy_to_1d( x, y ) {
  return x + 9 * y;
}

// -1 = draw
// 0 = win for x
// 1 = win for o
function game_over( status ) {
  if( status == -1 ) {
    window.alert("It's a draw!");
  } else if ( status === 0 ) {
    window.alert("Congrats to X!");
  } else {
    window.alert("Congrats to O!");
  }
  initialize();
}
