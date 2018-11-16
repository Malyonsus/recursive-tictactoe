build:
	mkdir -p dist
	coffee -c -o dist/ai.js ai.coffee
	cp index.html logic.js dist/

clean:
	rm -rf dist/
