# On OSX the PATH variable isn't exported unless "SHELL" is also set, see: http://stackoverflow.com/a/25506676
SHELL = /bin/bash
export PATH := ../node_modules/.bin:$(PATH)

# Where to find apps (it can be multiple paths).
APPS = $(shell find ../.. -maxdepth 1 -name 'web-app-*') ../../design-system ../../web-client ../../web-pkg ../../web-runtime

.PHONY: clean
clean:
	rm -f $(foreach app,$(APPS),$(app)/l10n/template.pot);
	rm -rf $(foreach app,$(APPS),$(app)/l10n/locale);

.PHONY: extract
extract: ./template.pot

# Create a main .pot template, then generate .po files for each available language.
# Thanks to Systematic: https://github.com/Polyconseil/systematic/blob/866d5a/mk/main.mk#L167-L183
./template.pot:
# Extract gettext strings from each apps templates files and create a POT dictionary template.
# Generate .po files for each available language.
	@for app in $(APPS); \
	do \
		(cd $$app && pnpm exec vue-gettext-extract --config ../../gettext.config.cjs); \
	done;

.PHONY: translations
translations: ./translations.json

# Generate translations.json file from all available apps .pot templates.
.PHONY: ./translations.json
./translations.json:
	@for app in $(APPS); \
	do \
		(cd $$app && ls -l l10n/locale/** && cat l10n/locale/de/app.po && pnpm exec vue-gettext-compile --config ../../gettext.config.cjs); \
	done; \

.PHONY: push
push:
	@for app in $(APPS); \
	do \
		cd $$app/l10n; \
		tx push -s; \
	done; \

.PHONY: pull
pull:
	@for app in $(APPS); \
	do \
		cd $$app/l10n; \
		tx pull -a; \
		ls -l locale/**; \
		cat l10n/locale/de/app.po; \
	done; \
