# renovate: datasource=github-releases depName=thegeeklab/hugo-geekdoc
THEME_VERSION ?= v0.47.0

.PHONY: theme-clean
theme-clean:
	rm -rf themes/hugo-geekdoc

.PHONY: theme-sync
theme-sync:
	mkdir -p themes/hugo-geekdoc; \
  curl -sSL https://github.com/thegeeklab/hugo-geekdoc/releases/download/$(THEME_VERSION)/hugo-geekdoc.tar.gz | tar -xz -C themes/hugo-geekdoc/ --strip-components=1

.PHONY: theme
theme: theme-clean theme-sync

.PHONY: clean
clean:
	rm -rf content public
