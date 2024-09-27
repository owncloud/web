Feature: details

  Scenario: Apps can be viewed and downloaded
    When "Admin" logs in
    And "Admin" navigates to the app store
    Then "Admin" should see the app store
    When "Admin" clicks on the app "Development boilerplate"
    Then "Admin" should see the app details of "Development boilerplate"
    And "Admin" downloads app version "0.1.0"
    When "Admin" navigates back to the app store overview
    Then "Admin" should see the app store
    And "Admin" downloads the latest version of the app "Development boilerplate"
    And "Admin" logs out
