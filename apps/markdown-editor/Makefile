apps=apps/markdown-editor
bundles=dist/markdown-editor.bundle.js

all: build

.PHONY: build
build: $(bundles)

node_modules: package.json yarn.lock
	yarn install && touch node_modules

$(bundles): webpack.config.js node_modules
	yarn run build

.PHONY: clean
clean:
	rm -Rf node_modules dist
