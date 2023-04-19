Feature: GDPR export
  As a user
  I want to be abble
  to export a listing of personal data that exist in the system

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |

  Scenario: User should be able to read and dismiss notifications
    And "Alice" logs in
    And "Alice" opens the user menu
    And "Alice" requests a new GDPR export
    And "Alice" downloads the GDPR export
    And "Alice" logs out
  