
# Group targets
all: deps lint test

# Install dependencies
deps:
	@echo "Installing dependencies..."
	@npm install

# Lint JavaScript
lint:
	@echo "Linting JavaScript..."
	@./node_modules/.bin/jshint \
		--config ./test/config/jshint.json \
		lib/* test/* bin/pa11y

# Run all tests
test: test-feature

# Run feature tests
test-feature:
	@echo "Running features..."
	@./node_modules/.bin/cucumber-js \
		--format pretty \
		./test/feature
