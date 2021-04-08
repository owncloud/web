@webUI @insulated @disablePreviews @systemtags-app-required @issue-ocis-reva-51
Feature: Suggestion for matching tag names
  As a user
  I want to get suggestions for adding tags from already existing tags
  So that I can easily categorize the files

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
    Given user "Alice" has created a "normal" tag with name "spam"
    And group "group1" has been created
    And user "Alice" has been added to group "group1"
    And user "Alice" has created a "normal" tag with name "ham"
    And user "Alice" has created a "normal" tag with name "notspam"
    And user "Alice" has created a "normal" tag with name "gham"
    And user "Alice" has created a "normal" tag with name "special"
    And user "Alice" has created a "normal" tag with name "specification"
    And the administrator has created a "not user-assignable" tag with name "Violates T&C"
    And the administrator has created a "not user-assignable" tag with name "sponsored"
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And user "Alice" has logged in using the webUI

  @skip @yetToImplement
  Scenario: User should get suggestion from already existing tags
    When the user browses directly to display the details of file "lorem.txt" in folder "simple-folder"
    And the user types "sp" in the collaborative tags field using the webUI
    Then all the tags starting with "sp" in their name should be listed in the dropdown list on the webUI
    But tag "gham" should not be listed in the dropdown list on the webUI
    But tag "notspam" should not be listed in the dropdown list on the webUI
    And tag "Violates T&C" should not be listed in the dropdown list on the webUI
    And tag "sponsored" should not be listed in the dropdown list on the webUI

  @skip @yetToImplement
  Scenario: User of static tags group should get suggestion for static tags
    When the user browses directly to display the details of file "lorem.txt" in folder "simple-folder"
    And the administrator has created a "static" tag with name "StaticTagName" and groups "group1"
    And the user types "St" in the collaborative tags field using the webUI
    Then all the tags starting with "St" in their name should be listed in the dropdown list on the webUI
    But tag "gham" should not be listed in the dropdown list on the webUI
    But tag "notspam" should not be listed in the dropdown list on the webUI
    And tag "Violates T&C" should not be listed in the dropdown list on the webUI
    And tag "sponsored" should not be listed in the dropdown list on the webUI
    And the tag "StaticTagName" should be listed in the dropdown list on the webUI
