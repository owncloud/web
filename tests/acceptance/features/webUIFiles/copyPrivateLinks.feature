Feature: copy current path as a permanent link
  As a user
  I want to copy the permanent link to the current folder
  So that I can share it with other users

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  Scenario: Copy permalink to clipboard
    When  the user copies the permalink of the current folder using the webUI
    Then the clipboard content should match current folder permalink
