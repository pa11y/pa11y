
Feature: Sniff a URL with a reporter specified
	As a developer
	I want to be able to use reporters to customise sniffer output
	So that I can integrate with CI and other build tools

	Scenario: Sniff a normal URL
		When I sniff a normal URL using the json reporter
		Then the command should be successful
		And the response should be valid JSON
		And I should see "Check that the title element"
		And I should see "alt text serves the same purpose"

	Scenario: Sniff a normal URL with an invalid reporter
		When I sniff a normal URL using the foo reporter
		Then the command should fail
		And I should see "Reporter foo not found"
