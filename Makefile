.PHONY: l10n-push
l10n-push:
	cd l10n && tx -d push -s --skip --no-interactive
	cd apps/files/l10n && tx -d push -s --skip --no-interactive

.PHONY: l10n-pull
l10n-pull:
	cd l10n && tx -d pull -a --skip
	cd apps/files/l10n && tx -d pull -a --skip

.PHONY: l10n-clean
l10n-clean:
	cd l10n && make clean

.PHONY: l10n-read
l10n-read: node_modules
	cd l10n && make extract

.PHONY: l10n-write
l10n-write: node_modules
	cd l10n && make translations
