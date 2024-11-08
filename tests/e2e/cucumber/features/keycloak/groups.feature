Feature: groups management

  Scenario: keycloak group sync with oCIS
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" creates following groups using API
      | id    |
      | sales |
    And "Alice" creates the following files into personal space using API
      | pathToFile          | content              |
      | shareToSales.txt    | Keycloak group share |
      | shareToSecurity.txt | Keycloak group share |

    When "Admin" logs in
    When "Admin" logs out
    When "Admin" logs in
    When "Admin" logs out
#    And "Admin" opens the "admin-settings" app
#    And "Admin" navigates to the groups management page
#    When "Admin" creates the following groups
#      | id       |
#      | security |
#      | finance  |
#    Then "Admin" should see the following group
#      | group    |
#      | security |
#      | finance  |
#    And "Admin" navigates to the users management page
#    When "Admin" adds the user "Brian" to the groups "finance,sales" using the sidebar panel
#
#    And "Alice" logs in
#    And "Alice" shares the following resource using the sidebar panel
#      | resource            | recipient | type  | role     | resourceType |
#      | shareToSales.txt    | sales     | group | Can edit | file         |
#      | shareToSecurity.txt | finance   | group | Can edit | file         |
#
#    And "Brian" logs in
#    And "Brian" navigates to the shared with me page
#    # user should have access to unsynced shares
#    And "Brian" opens the following file in texteditor
#      | resource         |
#      | shareToSales.txt |
#    And "Brian" closes the file viewer
#    And "Brian" edits the following resources
#      | resource            | content     |
#      | shareToSecurity.txt | new content |

    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    When "Admin" changes displayName to "a renamed group" for group "sales" using the sidebar panel

    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    And "Admin" deletes the following group using the context menu
      | group |
      | sales |
    Then "Admin" should not see the following group
      | group |
      | sales |
    When "Admin" deletes the following groups using the batch actions
      | group    |
      | security |
      | finance  |
    Then "Admin" should not see the following groups
      | group    |
      | security |
      | finance  |
