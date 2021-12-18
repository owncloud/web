Feature: Kindergarten can use web to organize a day

  As a kindergarten operator named Alice
  I want to manage all file related operations by using ownCloud WEB
  So that i'm sure all parents are informed and have the latest information in a easy and secure way

  Background:
    Given following users have been created
      | Alice |
      | Brian |
      | Carol |
    And admin set the default folder for received shares to "Shares"
    And admin disables auto accepting of the shares

  Scenario: Alice can share this weeks meal plan with all parents
    Given "Alice" has logged in
    Then "Alice" opens the "files" app
    Then "Alice" navigates to the files page
    Then "Alice" creates the following folders
      | groups/Pre-Schools Pirates/meal plan |
    And "Alice" uploads the following resources
      | resource          | to                                   |
      | lorem-big.txt     | groups/Pre-Schools Pirates/meal plan |
    Then "Alice" shares the following resources via the sidebar panel
      | resource                             | user  | role   |
      | groups/Pre-Schools Pirates/meal plan | Brian | editor |
      | groups/Pre-Schools Pirates/meal plan | Carol | viewer |
    Then "Alice" has logged out
    Given "Brian" has logged in
    Then "Brian" opens the "files" app
    Then "Brian" accepts the following resources
      | meal plan |
    Then "Brian" downloads the following files
      | resource      | from      |
      | lorem-ig.txt      | Shares/meal plan |
    Then "Brian" has logged out
    Given "Carol" has logged in
    Then "Carol" opens the "files" app
    Then "Carol" accepts the following resources
      | meal plan |
    Then "Carol" downloads the following files
      | resource      | from      |
      | lorem-big.txt      | Shares/meal plan |
    Then "Carol" has logged out

