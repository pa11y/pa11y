
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
test: test-unit test-feature

# Run unit tests
test-unit:
	@echo "Running unit tests..."
	@./node_modules/.bin/mocha \
		--reporter spec \
		--colors \
		--recursive \
		./test/unit

# Run feature tests
test-feature:
	@echo "Running features..."
	@./node_modules/.bin/cucumber-js \
		--format pretty \
		./test/feature
