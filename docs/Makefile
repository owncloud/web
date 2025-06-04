NAME := web
HUGO := ${CURDIR}/hugo
HDIR := ${CURDIR}/hugo/.git

# for drone only, run necessary doc prep commands. drone uses an image for hugo, so do not execute hugo with docs-build
# CURDIR will work for make only but not when running manually in the shell
.PHONY: docs-drone
docs-drone: docs-init docs-copy
	@echo 'Linking directory hugo for drone.'
	@ln -s $(HUGO) ../hugo

# run all necessary doc commands
.PHONY: docs
docs: docs-init docs-copy docs-build

# order-only-prerequisites, always execute @echo 
docs-init: | $(HDIR)
	@echo 'Directory hugo exists, nothing to setup, continuing.'

# if the directory does not extist, initialize and create the theme
$(HDIR):
	@mkdir -p $(HUGO)/content/
	@mkdir -p $(HUGO)/extensions/
	@cd $(HUGO) && git init
	@cd $(HUGO) && git config advice.detachedHead false
	@cd $(HUGO) && git remote rm origin || true
	@cd $(HUGO) && git remote add origin https://github.com/owncloud/owncloud.github.io
	@cd $(HUGO) && git fetch --depth=1
	@cd $(HUGO) && git checkout origin/main -f
	@cd $(HUGO) && make --no-print-directory theme

# create the build environment 
.PHONY: docs-init

# copy required resources into hugo
.PHONY: docs-copy
docs-copy:
	@echo 'Note on a fresh clone, you need to run `pnpm install` and `pnpm build` once to create required directories.'
	@echo 'Syncing required doc files and directories for the build process.'
	@rsync --delete -ax --exclude=hugo/ --exclude=.gitignore ./ $(HUGO)/content/$(NAME)

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
