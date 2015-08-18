
# Color helpers
C_CYAN=\x1b[34;01m
C_RESET=\x1b[0m

# Group targets
all: deps lint test
ci: lint test

# Install dependencies
deps:
	@echo "$(C_CYAN)> installing dependencies$(C_RESET)"
	@npm install

# Lint JavaScript
lint: jshint jscs

# Run JSHint
jshint:
	@echo "$(C_CYAN)> linting javascript$(C_RESET)"
	@./node_modules/.bin/jshint . ./bin/pa11y

# Run JavaScript Code Style
jscs:
	@echo "$(C_CYAN)> checking javascript code style$(C_RESET)"
	@./node_modules/.bin/jscs . ./bin/pa11y

# Run all tests
test: test-coverage test-integration

# Run unit tests
test-unit:
	@echo "$(C_CYAN)> running unit tests$(C_RESET)"
	@./node_modules/.bin/mocha ./test/unit --reporter spec --recursive --timeout 200 --slow 50

# Run unit tests with coverage
test-coverage:
	@echo "$(C_CYAN)> running unit tests with coverage$(C_RESET)"
	@./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- ./test/unit --reporter spec --recursive
	@./node_modules/.bin/istanbul check-coverage --statement 90 --branch 90 --function 90

# Run integration tests
test-integration:
	@echo "$(C_CYAN)> running integration tests$(C_RESET)"
	@./node_modules/.bin/mocha ./test/integration --reporter spec --recursive --timeout 5000 --slow 50

# Rebuild a local HTML CodeSniffer
build-htmlcs:
	@echo "$(C_CYAN)> building HTML CodeSniffer$(C_RESET)"
	@npm install git+ssh://git@github.com:squizlabs/HTML_CodeSniffer.git
	@npm install -g grunt-cli
	@cd ./node_modules/HTML_CodeSniffer && npm install --development
	@cd ./node_modules/HTML_CodeSniffer/Contrib/Grunt && grunt build
	@cat ./lib/vendor/HTMLCS-LICENSE > lib/vendor/HTMLCS.js
	@cat ./node_modules/HTML_CodeSniffer/build/HTMLCS.js >> lib/vendor/HTMLCS.js

.PHONY: test
