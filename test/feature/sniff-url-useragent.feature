
Feature: Sniff a URL with a useragent specified
	As a developer
	I want to be able to specify a unique user agent string
	So that I can filter pa11y from my logs and tracking

	Scenario: Sniff a normal URL
		When I sniff a normal URL
		Then the command should be successful
		And the user agent should be set to match the pa11y version number

	Scenario: Sniff a normal URL using a custom useragent
		When I sniff a normal URL using a useragent of "foo"
		Then the command should be successful
		And the user agent should be set to "foo"
