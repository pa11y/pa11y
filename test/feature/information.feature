
Feature: Program information
	As a developer
	I want to be able to see information about the program
	So that I don't have to leave the command line

	Scenario: Ask for help
		When I ask for help
		Then the command should be successful
		And I should see usage information

    Scenario: Ask for the program version
        When I ask for the program version
        Then the command should be successful
        And I should see the version number
