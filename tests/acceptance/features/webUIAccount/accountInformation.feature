Feature: View account information
  As a user
  I would like to view my account information
  So that I can verify and use my account details correctly

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files

  @ocis-reva-issue-107
  Scenario: view account information when the user has been created without group memberships
    Given user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | Alice                         |
      | Display name      | Alice Hansen                      |
      | Email             | alice@example.org             |
      | Group memberships | You are not part of any group |

  @ocis-konnectd-issue-42
  Scenario: view account information when the user has been added to a group
    Given these groups have been created:
      | groupname |
      | Group1    |
    And user "Alice" has been added to group "Group1"
    And user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | Alice             |
      | Display name      | Alice Hansen          |
      | Email             | alice@example.org |
      | Group memberships | Group1            |

  @ocis-reva-issue-107 @ocis-konnectd-issue-42
  Scenario: view account information when the user has been added to multiple groups
    Given these groups have been created:
      | groupname |
      | Group1    |
      | Group2    |
      | Group3    |
      | Group4    |
      | Group31   |
      | A111111   |
    And user "Alice" has been added to group "Group1"
    And user "Alice" has been added to group "Group2"
    And user "Alice" has been added to group "Group3"
    And user "Alice" has been added to group "Group4"
    And user "Alice" has been added to group "Group31"
    And user "Alice" has been added to group "A111111"
    And user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | Alice                                            |
      | Display name      | Alice Hansen                                         |
      | Email             | alice@example.org                                |
      | Group memberships | Group1, Group2, Group3, Group4, Group31, A111111 |
