Feature: Kindergarten can use web to organize a day

  As a kindergarten operator named Alice
  I want to manage all file related operations by using ownCloud WEB
  So that i'm sure all parents are informed and have the latest information in a easy and secure way
  Touch some files in the smoke tests to demonstrate 6153

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
      | groups/Kindergarten Koalas/meal plan |
      | groups/Pre-Schools Pirates/meal plan |
      | groups/Teddy Bear Daycare/meal plan  |
    And "Alice" uploads the following resources
      | resource          | to                                   |
      | PARENT/parent.txt | groups/Kindergarten Koalas/meal plan |
      | lorem.txt         | groups/Kindergarten Koalas/meal plan |
      | lorem-big.txt     | groups/Kindergarten Koalas/meal plan |
      | data.zip          | groups/Pre-Schools Pirates/meal plan |
      | lorem.txt         | groups/Pre-Schools Pirates/meal plan |
      | lorem-big.txt     | groups/Pre-Schools Pirates/meal plan |
      | data.zip          | groups/Teddy Bear Daycare/meal plan  |
      | lorem.txt         | groups/Teddy Bear Daycare/meal plan  |
      | lorem-big.txt     | groups/Teddy Bear Daycare/meal plan  |
    # Implementation of sharing with different roles is currently broken
    # since we switched to bulk creating of shares with a single dropdown
    Then "Alice" shares the following resources via the sidebar panel
      | resource                             | user  | role   |
      | groups/Pre-Schools Pirates/meal plan | Brian | editor |
      | groups/Pre-Schools Pirates/meal plan | Carol | viewer |
    Given "Brian" has logged in
    Then "Brian" opens the "files" app
    Then "Brian" accepts the following resources
      | meal plan |
    Then "Brian" downloads the following files
      | resource      | from      |
      | data.zip      | Shares/meal plan |
    Given "Carol" has logged in
    Then "Carol" opens the "files" app
    Then "Carol" accepts the following resources
      | meal plan |
    Then "Carol" downloads the following files
      | resource      | from      |
      | data.zip      | Shares/meal plan |
      | lorem.txt     | Shares/meal plan |
      | lorem-big.txt | Shares/meal plan |
    Then "Carol" has logged out
    Then "Brian" downloads the following files
      | resource      | from      |
      | lorem.txt     | Shares/meal plan |
      | lorem-big.txt | Shares/meal plan |
    Then "Brian" has logged out
    Then "Alice" downloads the following files
      | resource      | from                                 |
      | parent.txt    | groups/Kindergarten Koalas/meal plan |
      | lorem.txt     | groups/Kindergarten Koalas/meal plan |
      | lorem-big.txt | groups/Kindergarten Koalas/meal plan |
      | data.zip      | groups/Pre-Schools Pirates/meal plan |
      | lorem.txt     | groups/Pre-Schools Pirates/meal plan |
      | lorem-big.txt | groups/Pre-Schools Pirates/meal plan |
      | data.zip      | groups/Teddy Bear Daycare/meal plan  |
      | lorem.txt     | groups/Teddy Bear Daycare/meal plan  |
      | lorem-big.txt | groups/Teddy Bear Daycare/meal plan  |
    Then "Alice" has logged out

