Feature: View account information
  As a user
  I would like to view my account information
  So that I can verify and use my account details correctly

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  @ocis-reva-issue-107
  Scenario Outline: view account information when the user has been created without group memberships
    Given user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | Alice              |
      | Display name      | Alice Hansen       |
      | Email             | alice@example.org  |
      | Group memberships | <group-membership> |
    @skipOnOCIS
    Examples:
      | group-membership              |
      | You are not part of any group |
    @skipOnOC10
    Examples:
      | group-membership |
      | users            |

  @ocis-konnectd-issue-42
  Scenario Outline: view account information when the user has been added to a group
    Given these groups have been created in the server:
      | groupname |
      | Group1    |
    And user "Alice" has been added to group "Group1" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | Alice             |
      | Display name      | Alice Hansen      |
      | Email             | alice@example.org |
      | Group memberships | <group-membership> |
    @skipOnOCIS
    Examples:
      | group-membership |
      | Group1                |
    @skipOnOC10
    Examples:
      | group-membership |
      | users, Group1    |

  @ocis-reva-issue-107 @ocis-konnectd-issue-42
  Scenario Outline: view account information when the user has been added to multiple groups
    Given these groups have been created in the server:
      | groupname |
      | Group1    |
      | Group2    |
      | Group3    |
      | Group4    |
      | Group31   |
      | A111111   |
    And user "Alice" has been added to group "Group1" in the server
    And user "Alice" has been added to group "Group2" in the server
    And user "Alice" has been added to group "Group3" in the server
    And user "Alice" has been added to group "Group4" in the server
    And user "Alice" has been added to group "Group31" in the server
    And user "Alice" has been added to group "A111111" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the user should have following details displayed on the account information
      | Username          | Alice              |
      | Display name      | Alice Hansen       |
      | Email             | alice@example.org  |
      | Group memberships | <group-membership> |
    @skipOnOCIS
    Examples:
      | group-membership                                 |
      | Group1, Group2, Group3, Group4, Group31, A111111 |
    @skipOnOC10
    Examples:
      | group-membership                                        |
      | users, Group1, Group2, Group3, Group4, Group31, A111111 |
