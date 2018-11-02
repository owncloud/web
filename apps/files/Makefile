apps=apps/files
bundles=js/files.bundle.js

all: build

.PHONY: build
build: $(bundles)

node_modules: package.json package-lock.json
	yarn install && touch node_modules

$(bundles): webpack.common.js webpack.dev.js node_modules
	yarn run build

.PHONY: clean
clean:
	rm -Rf node_modules $(bundles)
