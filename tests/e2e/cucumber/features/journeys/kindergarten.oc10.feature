Feature: Kindergarten can use web to organize a day

  As a kindergarten operator named Alice
  I want to manage all file related operations by using ownCloud WEB
  So that i'm sure all parents are informed and have the latest information in a easy and secure way

  Background:
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "admin" sets the default folder for received shares to "Shares"
    And "Admin" disables share auto accepting

  Scenario: Alice can share this weeks meal plan with all parents
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources
      | resource                             | type   |
      | groups/Kindergarten Koalas/meal plan | folder |
      | groups/Pre-Schools Pirates/meal plan | folder |
      | groups/Teddy Bear Daycare/meal plan  | folder |
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
    And "Alice" shares the following resources using the sidebar panel
      | resource                             | recipient | type | role   |
      | groups/Pre-Schools Pirates/meal plan | Brian     | user | editor |
      | groups/Pre-Schools Pirates/meal plan | Carol     | user | viewer |
    # Then what do we check for to be confident that the above things done by Alice have worked?
    When "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name      |
      | meal plan |
    And "Brian" navigates to the personal space page
    And "Brian" downloads the following resources using the sidebar panel
      | resource | from             | type |
      | data.zip | Shares/meal plan | file |
    # Then what do we check for to be confident that the above things done by Brian have worked?
    # Then the downloaded zip should contain... ?
    When "Carol" logs in
    And "Carol" opens the "files" app
    And "Carol" navigates to the shared with me page
    And "Carol" accepts the following shares
      | name      |
      | meal plan |
    And "Carol" navigates to the personal space page
    And "Carol" downloads the following resources using the sidebar panel
      | resource      | from             | type   |
      | data.zip      | Shares/meal plan | file   |
      | lorem.txt     | Shares/meal plan | file   |
      | lorem-big.txt | Shares/meal plan | file   |
      | meal plan     | Shares           | folder |
    # Then what do we check for to be confident that the above things done by Carol have worked?
    # Then the downloaded files should have content "abc..."
    And "Carol" logs out
    When "Brian" downloads the following resources using the sidebar panel
      | resource      | from             | type   |
      | lorem.txt     | Shares/meal plan | file   |
      | lorem-big.txt | Shares/meal plan | file   |
      | meal plan     | Shares           | folder |
    # Then what do we check for to be confident that the above things done by Brian have worked?
    # Then the downloaded files should have content "abc..."
    And "Brian" logs out
    And "Alice" downloads the following resources using the sidebar panel
      | resource            | from                                 | type   |
      | parent.txt          | groups/Kindergarten Koalas/meal plan | file   |
      | lorem.txt           | groups/Kindergarten Koalas/meal plan | file   |
      | lorem-big.txt       | groups/Kindergarten Koalas/meal plan | file   |
      | data.zip            | groups/Pre-Schools Pirates/meal plan | file   |
      | lorem.txt           | groups/Pre-Schools Pirates/meal plan | file   |
      | lorem-big.txt       | groups/Pre-Schools Pirates/meal plan | file   |
      | data.zip            | groups/Teddy Bear Daycare/meal plan  | file   |
      | lorem.txt           | groups/Teddy Bear Daycare/meal plan  | file   |
      | lorem-big.txt       | groups/Teddy Bear Daycare/meal plan  | file   |
      | meal plan           | groups/Kindergarten Koalas           | folder |
      | meal plan           | groups/Pre-Schools Pirates           | folder |
      | meal plan           | groups/Teddy Bear Daycare            | folder |
      | Kindergarten Koalas | groups                               | folder |
      | Pre-Schools Pirates | groups                               | folder |
      | Teddy Bear Daycare  | groups                               | folder |
      | groups              |                                      | folder |
    And "Alice" deletes the following resources using the batch action
      | resource            | from                                 |
      | lorem.txt           | groups/Kindergarten Koalas/meal plan |
      | lorem-big.txt       | groups/Kindergarten Koalas/meal plan |
      | data.zip            | groups/Pre-Schools Pirates/meal plan |
      | lorem.txt           | groups/Pre-Schools Pirates/meal plan |
      | lorem-big.txt       | groups/Pre-Schools Pirates/meal plan |
      | data.zip            | groups/Teddy Bear Daycare/meal plan  |
      | lorem.txt           | groups/Teddy Bear Daycare/meal plan  |
      | lorem-big.txt       | groups/Teddy Bear Daycare/meal plan  |
      | Kindergarten Koalas | groups                               |
      | Pre-Schools Pirates | groups                               |
      | Teddy Bear Daycare  | groups                               |
    # Then what do we check for to be confident that the above things done by Alice have worked?
    # Then the downloaded files should have content "abc..."
    And "Alice" logs out
