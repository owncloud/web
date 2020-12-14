
SERVER_HOST=0.0.0.0:8300

apps=files
all_apps=$(addprefix app-,$(apps))
core_bundle=dist/core/core.bundle.js
DIST := dist
HUGO := hugo
NAME := web

all: build

.PHONY: build
build: core $(all_apps)

.PHONY: clean
clean: clean-core $(addprefix clean-app-,$(apps))

node_modules: package.json yarn.lock
	yarn install --frozen-lockfile && touch node_modules

dist/core/core.bundle.js: node_modules
	yarn run build:dev

#
# core
#
.PHONY: core
core: dist/core/core.bundle.js

.PHONY: clean-core
clean-core:
	rm -rf $(DIST) $(HUGO) $(CURDIR)/release $(CURDIR)/build/dist
	rm -rf node_modules

#
# Release
# make this app compatible with the ownCloud
# default build tools
#
.PHONY: dist
dist:
	make -f Makefile.release
	mkdir -p $(CURDIR)/build/dist
	cp $(CURDIR)/release/web-app.tar.gz $(CURDIR)/build/dist/

#
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
# Docs
#
.PHONY: docs-copy
docs-copy:
	mkdir -p $(HUGO); \
	mkdir -p $(HUGO)/content/extensions; \
	cd $(HUGO); \
	git init; \
	git remote rm origin; \
	git remote add origin https://github.com/owncloud/owncloud.github.io; \
	git fetch; \
	git checkout origin/source -f; \
	rsync --delete -ax ../docs/ content/$(NAME)

.PHONY: docs-build
docs-build:
	cd $(HUGO); hugo

.PHONY: docs
docs: docs-copy docs-build

#
# Test server
#
.PHONY: run
run:
	php -t dist/ -S "$(SERVER_HOST)"


.PHONY: l10n-push
l10n-push:
	cd l10n && tx -d push -s --no-interactive
	cd apps/files/l10n && tx -d push -s --no-interactive
	cd apps/media-viewer/l10n && tx -d push -s --no-interactive

.PHONY: l10n-pull
l10n-pull:
	cd l10n && tx -d pull -a
	cd apps/files/l10n && tx -d pull -a
	cd apps/media-viewer/l10n && tx -d pull -a

.PHONY: l10n-clean
l10n-clean:
	cd l10n && make clean

.PHONY: l10n-read
l10n-read: node_modules
	cd l10n && rm -rf template.pot && make extract

.PHONY: l10n-write
l10n-write: node_modules
	cd l10n && rm -rf translations.json && make translations
