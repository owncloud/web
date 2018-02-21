
SERVER_HOST=0.0.0.0:8300

uikit_dist=core/uikit/dist
uikit_deps=core/uikit/node_modules
uikit_theme_src=$(wildcard core/themes/*.less) $(wildcard core/themes/**/*.less)

apps=files
all_apps=$(addprefix app-,$(apps))

all: build

.PHONY: build
build: uikit $(all_apps)

.PHONY: clean
clean: clean-uikit $(addprefix clean-app-,$(apps))

#
# UIkit
#
uikit: $(uikit_dist)

$(uikit_deps):
	cd core/uikit && npm install

$(uikit_dist): $(uikit_deps) $(uikit_theme_src) core/uikit/package.json core/uikit/package-lock.json
	rm -Rf core/uikit/custom
	ln -s ../themes core/uikit/custom
	cd core/uikit && npm run compile

.PHONY: clean-uikit
clean-uikit:
	rm -Rf $(uikit_dist) $(uikit_deps) core/uikit/custom

#
# Apps
#
.PHONY: app-%
app-%:
	$(MAKE) -C apps/$*

.PHONY: clean-app-%
clean-app-%:
	$(MAKE) -C apps/$* clean

#
# Test server
#
.PHONY: run
run: build
	php -S "$(SERVER_HOST)"

.PHONY: watch
watch: build
	cd core/uikit && npm run watch

