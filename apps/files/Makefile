
uikit_dist=core/uikit/dist
uikit_deps=core/uikit/node_modules

apps=apps/files
bundles=js/files.bundle.js

all: build

.PHONY: build
build: $(bundles)

node_modules: package.json package-lock.json
	npm install

$(bundles): webpack.config.js node_modules
	npm run build

.PHONY: clean
clean:
	rm -Rf node_modules $(bundles)

