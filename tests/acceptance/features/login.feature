Feature: login users
	As a user
	I want to be able to log into my account
	So that I have access to my files

	As an admin
	I want only authorised users to log in
	So that unauthorised access is impossible

	Scenario: admin login
		Given the user has browsed to the login page
		When the user clicks the authenticate button
		And the user logs in with username "admin" and password "admin" using the webUI
		And the user authorizes access to phoenix
		And the user browses to the files page
		Then the files table should be displayed
		And the files table should not be empty
