#Recursive TicTacToe
===================

This is a JavaScript implementation of the recursive tic-tac-toe game that was popular for a while.

##Rules
===================

###Objective

Recursive TicTacToe (TicTacToe-ception) is played on a 9x9 grid, subdivided as though it were nine regular tic-tac-toe grids in a 3x3 arrangement. The objective is to win three of the "subboards" in a row (either horizontally, vertically, or diagonally). Winning a subboard is accomplished the same way as winning regular tic-tac-toe; that is, three Xs or Os in a row.

###Placement

The first player to go may place a mark in any square. Every subsequent move must be made on the subboard that "matches" the positioning of the move made by the previous player. (The correct board will be highlighted and no move may be made on an incorrect board.)

###Finishing Subboards

The moment a player makes a move that "wins" a subboard, that board is colored the player's color and scored in their favor. Additional moves may be made on this board, but no change to the victor will occur.

###No Moves Available

In the case that a player is required to make a move on a subboard that is full, the game ends in a draw.
