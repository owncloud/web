NAME := web
HUGO := ${CURDIR}/hugo
HDIR := ${CURDIR}/hugo/.git

hugo-exists:
## if the directory exists, print that we do not need to prepare
	@if [ -d $(HDIR) ]; then \
		echo 'Build environment for hugo exists, nothing to setup, continuing.'; \
	fi

$(HDIR):
## if the directory does not extist, initialize and create the theme
	@echo 'Creating build environment for hugo.'
	@mkdir -p $(HUGO)/content/
	@mkdir -p $(HUGO)/extensions/
	@cd $(HUGO) && git init
	@cd $(HUGO) && git config advice.detachedHead false
	@cd $(HUGO) && git remote rm origin || true
	@cd $(HUGO) && git remote add origin https://github.com/owncloud/owncloud.github.io
	@cd $(HUGO) && git fetch --depth=1
	@cd $(HUGO) && git checkout origin/main -f
	@cd $(HUGO) && make --no-print-directory theme

# for drone only, run necessary doc prep commands. drone uses an image for hugo, so do not execute hugo with docs-build
# CURDIR will work for make only but not when running manually in the shell
.PHONY: docs-drone
docs-drone: docs-init docs-copy
	@echo 'Linking directory hugo for drone.'
	@rm -f ../hugo
	@ln -s $(HUGO) ../hugo

# run all necessary doc commands
.PHONY: docs
docs: docs-init docs-copy docs-first-time-message docs-build

# create the build environment 
.PHONY: docs-init
docs-init: hugo-exists $(HDIR)
## if there is nothing to do, stop printing that
## another way would be https://stackoverflow.com/questions/58039810/makefiles-what-is-an-order-only-prerequisite
	@:

# print a hint when doing a local build because it may fail if you have not run pnpm commands at least once
docs-first-time-message:
	@echo 'Note, on a fresh web clone, you need to run `pnpm install` and `pnpm build` once to create required directories.'

# copy required resources into hugo
.PHONY: docs-copy
docs-copy:
	@echo 'Syncing required doc files and directories for the build process.'
	@rsync --delete -ax --exclude=hugo/ --exclude=Makefile ./ $(HUGO)/content/$(NAME)

# create a docs build
.PHONY: docs-build
docs-build:
	@cd $(HUGO) && hugo
	@echo 'To view the rendered docs in the browser, run: make docs-serve'

# serve built docs with hugo
.PHONY: docs-serve
docs-serve:
	@cd $(HUGO) && hugo server

# clean up docs build artifacts (removing the hogo folder)
.PHONY: docs-clean
docs-clean:
	@rm -rf $(HUGO)
	@echo "Removed folder: $(HUGO)"
