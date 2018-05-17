
# Reusable Makefile
# ------------------------------------------------------------------------
# This section of the Makefile should not be modified, it includes
# commands from my reusable Makefile: https://github.com/rowanmanning/make
include node_modules/@rowanmanning/make/javascript/index.mk
# [edit below this line]
# ------------------------------------------------------------------------


# Build tasks
# -----------

# Rebuild a local HTML CodeSniffer
build-htmlcs:
	@echo "building HTML CodeSniffer"
	@npm install --no-save grunt-cli git+ssh://git@github.com:squizlabs/HTML_CodeSniffer.git
	@cd ./node_modules/HTML_CodeSniffer && npm install --development
	@cd ./node_modules/HTML_CodeSniffer && ../../node_modules/.bin/grunt build-bookmarklet
	@cat ./lib/vendor/HTMLCS-LICENSE > lib/vendor/HTMLCS.js
	@cat ./node_modules/HTML_CodeSniffer/build/HTMLCS.js >> lib/vendor/HTMLCS.js
	@$(TASK_DONE)
