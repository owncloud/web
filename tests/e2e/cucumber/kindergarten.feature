Feature: Kindergarten can use web to organize a day

  As a kindergarten operator named Alice
  I want to manage all file related operations by using ownCloud WEB
  So that i'm sure all parents are informed and have the latest information in a easy and secure way

  Background:
    Given the following users have been created
      | Alice |
      | Brian |
      | Carol |
    And the default folder for received shares has been set to "Shares"
    And auto-accept shares has been disabled

  Scenario: Alice can share this weeks meal plan with all parents
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the files page
    And "Alice" creates the following folders
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
    And "Alice" shares the following resources via the sidebar panel
      | resource                             | user  | role   |
      | groups/Pre-Schools Pirates/meal plan | Brian | editor |
      | groups/Pre-Schools Pirates/meal plan | Carol | viewer |
    # Then what do we check for to be confident that the above things done by Alice have worked?
    When "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" accepts the following resources
      | meal plan |
    And "Brian" downloads the following files
      | resource      | from      |
      | data.zip      | Shares/meal plan |
    # Then what do we check for to be confident that the above things done by Brian have worked?
    # Then the downloaded zip should contain... ?
    When "Carol" logs in
    And "Carol" opens the "files" app
    And "Carol" accepts the following resources
      | meal plan |
    And "Carol" downloads the following files
      | resource      | from      |
      | data.zip      | Shares/meal plan |
      | lorem.txt     | Shares/meal plan |
      | lorem-big.txt | Shares/meal plan |
    # Then what do we check for to be confident that the above things done by Carol have worked?
    # Then the downloaded files should have content "abc..."
    And "Carol" logs out
    When "Brian" downloads the following files
      | resource      | from      |
      | lorem.txt     | Shares/meal plan |
      | lorem-big.txt | Shares/meal plan |
    # Then what do we check for to be confident that the above things done by Brian have worked?
    # Then the downloaded files should have content "abc..."
    And "Brian" logs out
    And "Alice" downloads the following files
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
    # Then what do we check for to be confident that the above things done by Alice have worked?
    # Then the downloaded files should have content "abc..."
    And "Alice" logs out
