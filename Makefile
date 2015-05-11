
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
lint:
	@echo "$(C_CYAN)> linting javascript$(C_RESET)"
	@./node_modules/.bin/jshint . --exclude node_modules --config .jshintrc

# Run all tests
test: test-unit test-integration

# Run unit tests
test-unit:
	@echo "$(C_CYAN)> running unit tests$(C_RESET)"
	@./node_modules/.bin/mocha ./test/unit --reporter spec --recursive

# Run integration tests
test-integration:
	@echo "$(C_CYAN)> running integration tests$(C_RESET)"
	@./node_modules/.bin/mocha ./test/integration --reporter spec --recursive

.PHONY: test
