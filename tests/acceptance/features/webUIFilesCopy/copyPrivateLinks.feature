@ocis-web-issue-52
Feature: copy path as a permanent link
  As a user
  I want to copy the permanent link of a resource
  So that I can share it with other users

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page


  Scenario Outline: Copy permalink to clipboard
    When the user copies the private link of the resource <resource_name> using the webUI
    Then as user "Alice" the clipboard content should match permalink of resource <resource_name>
    Examples:
      | resource_name   |
      | "lorem.txt"     |
      | "simple-folder" |
