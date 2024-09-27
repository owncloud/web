Feature: discovery

  Scenario: apps can be searched and downloaded
    When "Admin" logs in
    And "Admin" navigates to the app store
    Then "Admin" should see the app store
    And "Admin" should see the following apps
      | app         |
      | Draw.io     |
      | JSON Viewer |
      | Unzip       |
    When "Admin" enters the search term "draw"
    Then "Admin" should see the following apps
      | app     |
      | Draw.io |
    When "Admin" clicks on the tag "viewer" of the app "Draw.io"
    Then "Admin" should see the following apps
      | app         |
      | JSON Viewer |
      | Draw.io     |
    When "Admin" clicks on the app "JSON Viewer"
    Then "Admin" should see the app details of "JSON Viewer"
    When "Admin" clicks on the tag "viewer"
    Then "Admin" should see the app store
    Then "Admin" should see the following apps
      | app         |
      | JSON Viewer |
      | Draw.io     |
    And "Admin" logs out
