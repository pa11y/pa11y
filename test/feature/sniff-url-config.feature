
Feature: Sniff a URL with a config file specified
	As a developer
	I want to be able to use configurations to ignore certain rules
	So that I can reduce output noise, and see only messages which are important to me

	Scenario: Sniff a normal URL with a relative config file
		When I sniff a normal URL using a config file with a relative path
		Then the command should be successful
		And I should see "Results (2)"
		And I should see "Check that the title element"
		And I should not see "alt text serves the same purpose"

	Scenario: Sniff a normal URL with an absolute config file
		When I sniff a normal URL using a config file with an absolute path
		Then the command should be successful
		And I should see "Results (2)"
		And I should see "Check that the title element"
		And I should not see "alt text serves the same purpose"

	Scenario: Sniff a normal URL with a .pa11yrc default config file
		When I sniff a normal URL using a .pa11yrc config file
		Then the command should be successful
		And I should see "Results (2)"
		And I should see "Check that the title element"
		And I should not see "alt text serves the same purpose"

	Scenario: Sniff a normal URL with an invalid config file
		When I sniff a normal URL using an invalid config file
		Then I should see "Error: Config file invalidconfig.json not found"
