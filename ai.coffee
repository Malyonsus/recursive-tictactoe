# Write all new javascript in coffeescript, lol
primes = [2,3,5,7,9,11,13,17,19,23]
boards = []
top_board = []
subboard_next = []
ais = {}

zero_array = (size) ->
	0 for n in [0..size-1]

reset = () ->
	top_board = zero_array(9)
	boards = [0..8].map -> zero_array(9)
	# Force void
	return

self.onmessage = (event) ->
	command = event.data.cmd
	switch command
		when "move" then add_move(event.data.x, event.data.y)
		when "go"
			ai_name = event.data.ai
			postMessage(ais[ai_name]())

# Given an x,y coordinate in the 81 square space,
# return the subboard it's on (0 1 2/3 4 5/6 7 8)
get_subboard = (x,y) ->
	3 * (y // 3) + (x // 3)

get_square_on_subboard = (x,y) ->
	3 * (y % 3) + (x % 3)

first_unfilled = (subboard_index) ->
	return i for v,i in boards[subboard_index] when v is 0

unfilled_squares = (subboard_index) ->
	return (i for v,i in boards[subboard_index] when v is 0)

# This is the call to mutate the board from user-space
add_move = (x,y) ->
	subboard_index = get_subboard(x,y)
	square_index = get_square_on_subboard(x,y)
	boards[subboard_index][square_index] = true
	subboard_next.push square_index
	return

# This is the call to get the next move to make
ais["random"] = () ->
	subboard = subboard_next[-1..][0]

	# selection = first_unfilled(subboard)

	options = unfilled_squares(subboard)
	console.log options
	selection = options[Math.random() * options.length // 1]

	x = selection % 3 + 3 * (subboard % 3)
	y = selection // 3 + 3 * (subboard // 3)
	add_move(x,y)
	return [x,y]

ais["greedy"] = () ->
	subboard = subboard_next[-1..][0]
	selection = first_unfilled(subboard)
	x = selection % 3 + 3 * (subboard % 3)
	y = selection // 3 + 3 * (subboard // 3)
	add_move(x,y)
	return [x,y]

reset()
