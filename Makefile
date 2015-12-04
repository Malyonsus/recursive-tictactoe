build:
	mkdir -p dist
	coffee -c ai.coffee
	cp ai.js index.html logic.js dist/
	rm ai.js

clean:
	rm -rf dist/
