# Write all new javascript in coffeescript, lol
primes = [2,3,5,7,9,11,13,17,19,23]
boards = []
top_board = []
subboard_next = []
turn = 1 # arbitrarily 1 is x, -1 is o
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
	boards[subboard_index][square_index] = turn
	subboard_next.push square_index
	turn = turn * -1
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
ais["focused"] = {}
ais["focused"].move = () ->
	if subboard_next.length < 1
		return [4,4]

	subboard_index = subboard_next[-1..][0]
	subboard = boards[subboard_index]
	v = 2 * turn # number for matching one left
	wins = []
	losses = []
	rows = [
		subboard[0] + subboard[1] + subboard[2],
		subboard[3] + subboard[4] + subboard[5],
		subboard[6] + subboard[7] + subboard[8]
	]
	cols = [
		subboard[0] + subboard[3] + subboard[6],
		subboard[1] + subboard[4] + subboard[7],
		subboard[2] + subboard[5] + subboard[8]
	]
	diags = [
		subboard[0] + subboard[4] + subboard[8],
		subboard[2] + subboard[4] + subboard[6]
	]
	for total,i in rows
		val_array = [subboard[i], subboard[i+1], subboard[i+2]]
		if total == v
			wins.push( (3*i+j for a, j in val_array when a is 0)[0] )
		if total == -v
			losses.push( (3*i+j for a, j in val_array when a is 0)[0] )
	for total, i in cols
		val_array = [subboard[i], subboard[i+3], subboard[i+6]]
		if total == v
			wins.push( (3*j+i for a, j in val_array when a is 0)[0] )
		if total == -v
			losses.push( (3*j+i for a, j in val_array when a is 0)[0] )
	if diags[0] == v or diags[0] == -v
		indices = [0, 4, 8]
		if total == v
			wins.push( (i for i in indices when subboard[i] is 0)[0] )
		if total == -v
			losses.push( (i for i in indices when subboard[i] is 0)[0] )
	if diags[1] == v or diags[1] == -v
		indices = [2,4,6]
		if total == v
			wins.push( (i for i in indices when subboard[i] is 0)[0] )
		if total == -v
			losses.push( (i for i in indices when subboard[i] is 0)[0] )

	console.log(wins, losses)
	moves = [wins...,losses...]
	if moves.length == 0
		return ais["random"].move()
	selection = moves[0]
	x = selection % 3 + 3 * (subboard_index % 3)
	y = selection // 3 + 3 * (subboard_index // 3)
	add_move(x,y)
	return[x,y]

reset()
