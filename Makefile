DIST := dist
HUGO := hugo
NAME := web

all: build

.PHONY: clean
clean:
	rm -rF ${DIST} ${HUGO} ./release ./node_modules

.PHONY: dist
dist:
	make -f Makefile.release
	mkdir -p $(CURDIR)/build/dist
	cp $(CURDIR)/release/web-app.tar.gz $(CURDIR)/build/dist/

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

.PHONY: l10n-push
l10n-push:
	cd l10n && tx -d push -s --no-interactive
	cd apps/files/l10n && tx -d push -s --no-interactive
	cd apps/markdown-editor/l10n && tx -d push -s --no-interactive
	cd apps/media-viewer/l10n && tx -d push -s --no-interactive

.PHONY: l10n-pull
l10n-pull:
	cd packages/web-runtime/l10n && tx -d pull -a
	cd packages/web-app-files/l10n && tx -d pull -a
	cd packages/web-app-draw-io/l10n && tx -d pull -a
	cd packages/web-app-media-viewer/l10n && tx -d pull -a

.PHONY: l10n-clean
l10n-clean:
	cd packages/web-runtime/l10n && make clean

.PHONY: l10n-read
l10n-read: node_modules
	cd packages/web-runtime/l10n && rm -rf template.pot && make extract

.PHONY: l10n-write
l10n-write: node_modules
	cd packages/web-runtime/l10n && rm -rf translations.json && make translations
