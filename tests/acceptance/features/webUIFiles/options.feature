Feature: Set config options from phoenix config file

  Background:
    And user "user1" has been created with default attributes

  Scenario: Set config to hide the search bar
    Given the property "hideSearchBar" of "options" has been set to true in phoenix config file
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should not be visible in the webUI

  Scenario: Set config to show the search bar
    Given the property "hideSearchBar" of "options" has been set to false in phoenix config file
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should be visible in the webUI

  Scenario: Set config to hide the search bar while the user is logged in
    Given the property "hideSearchBar" of "options" has been set to false in phoenix config file
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should be visible in the webUI
    When the property "hideSearchBar" of "options" is changed to true in phoenix config file
    And the user browses to the files page
    Then the search bar should not be visible in the webUI

  Scenario: Set config to show the search bar while the user is logged in
    Given the property "hideSearchBar" of "options" has been set to true in phoenix config file
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should not be visible in the webUI
    When the property "hideSearchBar" of "options" is changed to false in phoenix config file
    And the user browses to the files page
    Then the search bar should be visible in the webUI
