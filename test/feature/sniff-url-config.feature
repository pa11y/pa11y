
Feature: Sniff a URL with a config file specified
	As a developer
	I want to be able to use configurations to ignore certain rules
	So that I can reduce output noise, and see only messages which are important to me

	Scenario: Sniff a normal URL
		When I sniff a normal URL using a config file
		Then the command should be successful
		And I should see "Results (1)"
		And I should see "Check that the title element"
		And I should not see "The html element should have a lang"

	Scenario: Sniff a normal URL with an invalid config file
		When I sniff a normal URL using an invalid config file
		Then I should see "Error: Config file invalidconfig.json not found"
