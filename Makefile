
SERVER_HOST=0.0.0.0:8300

apps=files
all_apps=$(addprefix app-,$(apps))
core_bundle=dist/core/core.bundle.js

all: build

.PHONY: build
build: core $(all_apps)

.PHONY: clean
clean: clean-core $(addprefix clean-app-,$(apps))

node_modules: package.json yarn.lock
	yarn install && touch node_modules

dist/core/core.bundle.js: node_modules
	yarn run build:dev

#
# core
#
.PHONY: core
core: dist/core/core.bundle.js

.PHONY: clean-core
clean-core:
	rm -rf dist
	rm -rf node_modules

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
run:
	php -t dist/ -S "$(SERVER_HOST)"


.PHONY: l10n-push
l10n-push:
	cd l10n && tx -d push -s --skip --no-interactive
	cd apps/files/l10n && tx -d push -s --skip --no-interactive
	cd apps/markdown-editor/l10n && tx -d push -s --skip --no-interactive
	cd apps/pdf-viewer/l10n && tx -d push -s --skip --no-interactive

.PHONY: l10n-pull
l10n-pull:
	cd l10n && tx -d pull -a --skip
	cd apps/files/l10n && tx -d pull -a --skip
	cd apps/markdown-editor/l10n && tx -d pull -a --skip
	cd apps/pdf-viewer/l10n && tx -d pull -a --skip

.PHONY: l10n-clean
l10n-clean:
	cd l10n && make clean

.PHONY: l10n-read
l10n-read: node_modules
	cd l10n && rm -rf template.pot && make extract

.PHONY: l10n-write
l10n-write: node_modules
	cd l10n && rm -rf translations.json && make translations
