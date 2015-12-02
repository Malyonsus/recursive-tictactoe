# Write all new javascript in coffeescript, lol
primes = [2,3,5,7,9,11,13,17,19,23]
boards = []
top_board = []
subboard_next = []

zero_array = (size) ->
	0 for n in [0..size-1]

reset = () ->
	top_board = zero_array(9)
	boards = [0..8].map -> zero_array(9)
	# Force void
	return

self.onmessage = (event) ->
	add_move(event.data...)
	postMessage(get_move())

# Given an x,y coordinate in the 81 square space,
# return the subboard it's on (0 1 2/3 4 5/6 7 8)
get_subboard = (x,y) ->
	3 * (y // 3) + (x // 3)

get_square_on_subboard = (x,y) ->
	3 * (y % 3) + (x % 3)

first_unfilled = (subboard_index) ->
	return i for v,i in boards[subboard_index] when v is 0

# This is the call to mutate the board from user-space
add_move = (x,y) ->
	subboard_index = get_subboard(x,y)
	square_index = get_square_on_subboard(x,y)
	console.log ["Setting", subboard_index, square_index, "to true"]
	boards[subboard_index][square_index] = true
	subboard_next.push square_index
	return

# This is the call to get the next move to make
get_move = () ->
	subboard = subboard_next[-1..][0]
	console.log ["I think the board is", subboard]
	console.log ["The state of that board is", boards[subboard]]
	selection = first_unfilled(subboard)
	x = selection % 3
	y = selection // 3
	console.log([x,y])
	# now we need to add the x and y offset of the subboard
	x = x + 3 * (subboard % 3)
	y = y + 3 * (subboard // 3)
	console.log([x,y])
	add_move(x,y)
	return [x,y]

reset()
