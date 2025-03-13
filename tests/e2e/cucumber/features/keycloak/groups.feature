Feature: groups management
  As a user
  I want to manage all group-related operations using ownCloud Web
  So that I can ensure all group-related operations work correctly with Keycloak integration
  # For synchronization-related details, see https://owncloud.dev/services/proxy/#claim-updates


  Scenario: keycloak group sync with oCIS
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" creates the following files into personal space using API
      | pathToFile          | content              |
      | shareToSales.txt    | Keycloak group share |
      | shareToSecurity.txt | Keycloak group share |

    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    When "Admin" creates the following groups
      | id       |
      | security |
      | sales    |
    Then "Admin" should see the following group
      | group            |
      | security         |
      | keycloak sales   |
      | keycloak finance |

    When "Admin" navigates to the users management page
    And "Admin" adds the user "Brian" to the groups "security,keycloak sales" using the sidebar panel
    And "Admin" logs out

    And "Alice" logs in
    And "Alice" shares the following resource using the sidebar panel
      | resource            | recipient      | type  | role                      | resourceType |
      | shareToSales.txt    | keycloak sales | group | Can edit without versions | file         |
      | shareToSecurity.txt | security       | group | Can edit without versions | file         |
    And "Alice" logs out

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    # user should have access to unsynced shares
    When "Brian" opens the following file in texteditor
      | resource         |
      | shareToSales.txt |
    And "Brian" closes the file viewer
    And "Brian" edits the following resources
      | resource            | content     |
      | shareToSecurity.txt | new content |
    And "Brian" logs out

    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    # Renaming a Keycloak group results in the creation of a new group on the oCIS server (see https://github.com/owncloud/ocis/issues/10445).
    # After renaming a group, it may take up to 5 minutes for the changes to sync, so avoid using the renamed group in the subsequent steps.
    And "Admin" changes displayName to "a renamed group" for group "keycloak finance" using the sidebar panel

    When "Admin" deletes the following group using the context menu
      | group |
      | sales |
    Then "Admin" should not see the following group
      | group |
      | sales |
    And "Admin" logs out
