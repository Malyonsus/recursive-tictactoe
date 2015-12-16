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
			postMessage(ais[ai_name].move())

# Given an x,y coordinate in the 81 square space,
# return the subboard it's on (0 1 2/3 4 5/6 7 8)
get_subboard = (x,y) ->
	3 * (y // 3) + (x // 3)

get_square_on_subboard = (x,y) ->
	3 * (y % 3) + (x % 3)

ais.first_unfilled = (subboard_index) ->
	return i for v,i in boards[subboard_index] when v is 0

ais.unfilled_squares = (subboard_index) ->
	return (i for v,i in boards[subboard_index] when v is 0)

# This is the call to mutate the board from user-space
add_move = (x,y) ->
	subboard_index = get_subboard(x,y)
	square_index = get_square_on_subboard(x,y)
	boards[subboard_index][square_index] = true
	subboard_next.push square_index
	return

##
# The idea of the AI dict is that each namespace can contain
# local AI functions if necessary without polluting the file-scope namespace.
# Does that matter? Who knows!
##

# The random ai simply makes a random move on the currently active subboard.
ais["random"] = {}
ais["random"].move = () ->
	if subboard_next.length >= 1
		subboard = subboard_next[-1..][0]
		options = ais.unfilled_squares(subboard)
		selection = options[Math.random() * options.length // 1]

		x = selection % 3 + 3 * (subboard % 3)
		y = selection // 3 + 3 * (subboard // 3)
	else
		x = Math.random() * 9 // 1
		y = Math.random() * 9 // 1

	add_move(x,y)
	return [x,y]

# The greedy ai picks the first open square on the currently active subboard.
ais["greedy"] = {}
ais["greedy"].move = () ->
	if subboard_next.length >= 1
		subboard = subboard_next[-1..][0]
		selection = ais.first_unfilled(subboard)
		x = selection % 3 + 3 * (subboard % 3)
		y = selection // 3 + 3 * (subboard // 3)
	else
		x = y = 0 # first available, yeah?

	add_move(x,y)
	return [x,y]

# The focused ai will play the best move for the current active subboard.
# That is, it 'focuses' on winning subboards.

reset()
