Feature: Users can extract zip file
  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |

  Scenario: Extract zip file
    Given "Alice" uploads the following local file into personal space using API
      | localFile               | to       |
      | filesForUpload/data.zip | data.zip |
    And "Alice" logs in
    When "Alice" extracts a file "data.zip" using the right-click context menu
    And "Alice" opens folder "data"
    Then "Alice" should see thumbnail and preview for file "logo-wide.png"
    And "Alice" should be able to edit file "lorem.txt"

    # https://github.com/owncloud/web/issues/11898
    # When "Alice" extracts a file "data.zip" using the sidebar panel
    # And "Alice" opens folder "data (1)"
    # Then "Alice" should see thumbnail and preview for file "logo-wide.png"
    # And "Alice" should be able to edit file "lorem.txt"

    And "Alice" logs out
