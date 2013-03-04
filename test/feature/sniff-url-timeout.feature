
Feature: Sniff a URL with a timeout specified
	As a developer
	I want to be able to use timeouts
	So that I can reduce wait time when pages are slow to load

	Scenario: Sniff a normal URL
		When I sniff a normal URL using a 200ms timeout
		Then the command should fail
		And I should see "PhantomJS timeout"

	Scenario: Sniff a normal URL with an invalid timeout
		When I sniff a normal URL using a FOOms timeout
		Then I should see usage information
