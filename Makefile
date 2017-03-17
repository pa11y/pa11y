include Makefile.node


# Verify tasks
# ------------

# Lint alias for backwards compatibility
lint: verify


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
