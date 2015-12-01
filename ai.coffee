# Write all new javascript in coffeescript, lol
primes = [2,3,5,7,9,11,13,17,19,23]
boards = []
top_board = []

zero_array = (size) ->
	0 for n in [0..size-1]

reset = () ->
	top_board = zero_array(9)
	boards = [0..8].map -> zero_array(9)
	# Force void
	return

# Given an x,y coordinate in the 81 square space,
# return the subboard it's on (0 1 2/3 4 5/6 7 8)
get_subboard = (x,y) ->
	3 * (y // 3) + (x // 3)

get_square_on_subboard = (x,y) ->
	3 * (y % 3) + (x % 3)

# This is the call to mutate the board from user-space
window.add_move = (x,y) ->
	return

console.log get_subboard(5,2)
console.log get_square_on_subboard(5,2)
