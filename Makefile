
SERVER_HOST=0.0.0.0:8300

apps=files
all_apps=$(addprefix app-,$(apps))
core_bundle=core/js/core.bundle.js

all: build

.PHONY: build
build: core $(all_apps)

.PHONY: clean
clean: clean-core $(addprefix clean-app-,$(apps))

node_modules: package.json package-lock.json
	npm install && touch node_modules

core/css/uikit.%.css: src/themes/%.less node_modules
	node_modules/less/bin/lessc src/themes/$*.less core/css/uikit.$*.css --relative-urls

core/css/material-icons.css: src/themes/icons.scss node_modules
	node node_modules/.bin/sass src/themes/icons.scss core/css/material-icons.css --no-source-map

core/fonts: node_modules
	mkdir core/fonts

core/fonts/MaterialIcons-Regular.%: core/fonts node_modules
	cp node_modules/material-icons/iconfont/MaterialIcons-Regular.* core/fonts/


core/js/core.bundle.js: node_modules
	npm run build

#
# core
#
.PHONY: core
core: core/js/core.bundle.js core/css/uikit.owncloud.css core/css/material-icons.css core/fonts/MaterialIcons-Regular.%

.PHONY: clean-core
clean-core:
	rm -rf core/js/core.bundle.js.* core/css/uikit.*.css core/fonts core/css/material-icons.css
	rm -Rf node_modules

#
# Apps
#
.PHONY: app-%
app-%:
	@echo Building app $*
	$(MAKE) -C apps/$*

.PHONY: clean-app-%
clean-app-%:
	@echo Cleaning up app $*
	$(MAKE) -C apps/$* clean

#
# Test server
#
.PHONY: run
run: build
	php -S "$(SERVER_HOST)"
