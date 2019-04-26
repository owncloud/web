apps=apps/pdf-viewer
bundles=dist/pdf-viewer.bundle.js

all: build

.PHONY: build
build: $(bundles)

node_modules: package.json yarn.lock
	yarn install && touch node_modules

$(bundles): webpack.common.js webpack.dev.js node_modules
	yarn run build

.PHONY: clean
clean:
	rm -Rf node_modules dist
