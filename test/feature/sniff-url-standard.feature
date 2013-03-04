
Feature: Sniff a URL with a standard specified
	As a developer
	I want to be able to specify different accessibility standards
	So that I can change reporting based on the standards we work to

	Scenario: Sniff a normal URL
		When I sniff a normal URL using the Section508 standard
		Then the command should be successful
		And I should see "No errors"

	Scenario: Sniff a normal URL with an invalid standard
		When I sniff a normal URL using the FOO standard
		Then I should see usage information
