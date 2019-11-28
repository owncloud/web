Feature: View account information
  As a user
  I would like to view my account information
  So that I can verify and use my account details correctly

  Background:
    Given user "user1" has been created with default attributes

  Scenario: view account information when the user has been created without groups membership
    Given user "user1" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | user1                         |
      | Display name      | User One                      |
      | Email             | user1@example.org             |
      | Groups membership | You are not part of any group |

  Scenario: view account information when the user has been added to a group
    Given these groups have been created:
      | groupname |
      | Group1    |
    And user "user1" has been added to group "Group1"
    And user "user1" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | user1             |
      | Display name      | User One          |
      | Email             | user1@example.org |
      | Groups membership | Group1            |

  Scenario: view account information when the user has been added to multiple groups
    Given these groups have been created:
      | groupname |
      | Group1    |
      | Group2    |
      | Group3    |
      | Group4    |
      | Group31   |
      | A111111   |
    And user "user1" has been added to group "Group1"
    And user "user1" has been added to group "Group2"
    And user "user1" has been added to group "Group3"
    And user "user1" has been added to group "Group4"
    And user "user1" has been added to group "Group31"
    And user "user1" has been added to group "A111111"
    And user "user1" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | user1                                            |
      | Display name      | User One                                         |
      | Email             | user1@example.org                                |
      | Groups membership | Group1, Group2, Group3, Group4, Group31, A111111 |
