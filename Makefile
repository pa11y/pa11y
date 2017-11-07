# Reusable Makefile
# ------------------------------------------------------------------------
# This section of the Makefile should not be modified, it includes
# commands from my reusable Makefile: https://github.com/rowanmanning/make
include node_modules/@rowanmanning/make/javascript/index.mk
# [edit below this line]
# ------------------------------------------------------------------------

INTEGRATION_TIMEOUT = 10000
INTEGRATION_SLOW = 5000


# Build tasks
# -----------

# Rebuild a local HTML CodeSniffer
build-htmlcs:
	@echo "building HTML CodeSniffer"
	@npm install git+ssh://git@github.com:squizlabs/HTML_CodeSniffer.git
	@npm install -g grunt-cli
	@cd ./node_modules/HTML_CodeSniffer && npm install --development
	@cd ./node_modules/HTML_CodeSniffer && grunt build
	@cat ./lib/vendor/HTMLCS-LICENSE > lib/vendor/HTMLCS.js
	@cat ./node_modules/HTML_CodeSniffer/build/HTMLCS.js >> lib/vendor/HTMLCS.js
	@$(TASK_DONE)
