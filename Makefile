
SERVER_HOST=0.0.0.0:8300

apps=files
all_apps=$(addprefix app-,$(apps))

all: build

.PHONY: build
build: core $(all_apps)

.PHONY: clean
clean: clean-core $(addprefix clean-app-,$(apps))

#
# core
#
.PHONY: core
core:
	npm install
	node_modules/less/bin/lessc src/themes/owncloud.less core/css/uikit.owncloud.css --relative-urls
	npm run build

.PHONY: clean-core
clean-core:
	rm -rf core/js/core.bundle.js.*

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

