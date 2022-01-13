NAME := web
DIST := ${CURDIR}/dist
HUGO := ${CURDIR}/hugo
RELEASE := ${CURDIR}/release
OCX_RELEASE := $(CURDIR)/build/dist
NODE_MODULES := ${CURDIR}/node_modules

node_modules: package.json yarn.lock
	yarn install --immutable && touch ${NODE_MODULES}

.PHONY: clean
clean:
	rm -rf ${DIST} ${HUGO} ${RELEASE} ${OCX_RELEASE} ${NODE_MODULES}

.PHONY: release
release: clean
	make -f Makefile.release

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

.PHONY: docs
docs: docs-copy docs-build

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
	make -C $(HUGO) theme; \
	rsync --delete -ax ../docs/ content/$(NAME)

.PHONY: docs-build
docs-build:
	cd $(HUGO); hugo

.PHONY: l10n-push
l10n-push:
	make -C packages/web-runtime/l10n push

.PHONY: l10n-pull
l10n-pull:
	make -C packages/web-runtime/l10n pull

.PHONY: l10n-clean
l10n-clean:
	make -C packages/web-runtime/l10n clean

.PHONY: l10n-read
l10n-read: node_modules
	make -C packages/web-runtime/l10n extract

.PHONY: l10n-write
l10n-write: node_modules
	make -C packages/web-runtime/l10n translations