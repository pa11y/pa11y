
Feature: Sniff a URL
	As a developer
	I want to be able to sniff a HTML page for accessibility issues
	So that I can improve the accessiblity of my sites

	Scenario: Sniff a normal URL
		When I sniff a normal URL
		Then the command should be successful
		And I should see "Results (3)"
		And I should see "Check that the title element"
		And I should see "alt text serves the same purpose"

	Scenario: Sniff a failing URL
		When I sniff a failing URL
		Then the command should fail
		And I should see "Results (2)"
		And I should see "html element should have a lang"

	Scenario: Sniff a redirecting URL
		When I sniff a redirecting URL
		Then the command should be successful
		And I should see "Results (3)"

	Scenario: Sniff an invalid URL
		When I sniff an invalid URL
		Then the command should fail
		And I should see "URL could not be loaded"
