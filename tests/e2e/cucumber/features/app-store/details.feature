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


# Errors  Files
#      6  tests/e2e/support/objects/app-files/link/actions.ts:122
#     26  tests/e2e/support/objects/app-files/resource/actions.ts:152
#      1  tests/e2e/support/objects/app-files/resource/index.ts:207
#      1  tests/e2e/support/objects/app-files/share/actions.ts:44
#      1  tests/e2e/support/objects/app-files/spaces/index.ts:51
