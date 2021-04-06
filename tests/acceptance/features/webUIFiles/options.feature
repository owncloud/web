Feature: Set config options from web config file

  Background:
    And user "Alice" has been created with default attributes and without skeleton files


  Scenario: Set config to hide the search bar
    Given the property "hideSearchBar" of "options" has been set to true in web config file
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should not be visible in the webUI


  Scenario: Set config to show the search bar
    Given the property "hideSearchBar" of "options" has been set to false in web config file
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should be visible in the webUI


  Scenario: Set config to hide the search bar while the user is logged in
    Given the property "hideSearchBar" of "options" has been set to false in web config file
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should be visible in the webUI
    When the property "hideSearchBar" of "options" is changed to true in web config file
    And the user reloads the current page of the webUI
    Then the search bar should not be visible in the webUI


  Scenario: Set config to show the search bar while the user is logged in
    Given the property "hideSearchBar" of "options" has been set to true in web config file
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the search bar should not be visible in the webUI
    When the property "hideSearchBar" of "options" is changed to false in web config file
    And the user reloads the current page of the webUI
    Then the search bar should be visible in the webUI
