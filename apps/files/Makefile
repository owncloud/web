apps=apps/files
bundles=js/files.bundle.js

all: build

.PHONY: build
build: $(bundles)

node_modules: package.json package-lock.json
	npm install && touch node_modules

$(bundles): webpack.common.js webpack.dev.js node_modules
	npm run build

.PHONY: clean
clean:
	rm -Rf node_modules $(bundles)
