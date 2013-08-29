
Feature: Sniff a URL with a port specified
	As a developer
	I want to be able to specify a port
	So that I can run multiple instances of pa11y in unison

	Scenario: Sniff a normal URL
		When I sniff a normal URL (and don't wait)
		Then port 12300 should be in use

	Scenario: Sniff a normal URL using a custom port
		When I sniff a normal URL using a port of 12400 (and don't wait)
		Then port 12400 should be in use
