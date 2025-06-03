DIST := ${CURDIR}/dist
HUGO := docs/hugo
RELEASE := ${CURDIR}/release
NODE_MODULES := ${CURDIR}/node_modules

node_modules: package.json pnpm-lock.yaml
	[ -n "${NO_INSTALL}" ] || pnpm install
	touch ${NODE_MODULES}

.PHONY: clean
clean:
	rm -rf ${DIST} ${HUGO} ${RELEASE} ${NODE_MODULES}

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

# note that everything docs related is located in the docs/ folder
# we keep this original calls for the sake of history and ease of use
# build the docs
.PHONY: docs
docs:
	@make --no-print-directory -C docs docs

# serve the built docs
.PHONY: docs-serve
docs-serve:
	@make --no-print-directory -C docs docs-serve

# clean up doc build artifacts 
.PHONY: docs-clean
docs-clean:
	@make --no-print-directory -C docs docs-clean

# translation relevant
.PHONY: l10n-push
l10n-push:
	@make --no-print-directory -C packages/web-runtime/l10n push

.PHONY: l10n-pull
l10n-pull:
	@make --no-print-directory -C packages/web-runtime/l10n pull

.PHONY: l10n-clean
l10n-clean:
	@make --no-print-directory -C packages/web-runtime/l10n clean

.PHONY: l10n-read
l10n-read: node_modules
	make --no-print-directory -C packages/web-runtime/l10n extract

.PHONY: l10n-write
l10n-write: node_modules
	@make --no-print-directory -C packages/web-runtime/l10n translations

.PHONY: generate-qa-activity-report
generate-qa-activity-report: node_modules
	@if [ -z "${MONTH}" ] || [ -z "${YEAR}" ]; then \
		echo "Please set the MONTH and YEAR environment variables. Usage: make generate-qa-activity-report MONTH=<month> YEAR=<year>"; \
		exit 1; \
	fi
	pnpm exec node generate-qa-activity-report.js --month ${MONTH} --year ${YEAR}
