@predefined-users
Feature: GDPR export
  As a user
  I want to export a report of all my personal data
  So I know what data is currently being stored on the system

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |

  Scenario: User should be able to create and download a GDPR export
    And "Alice" logs in
    And "Alice" opens the user menu
    And "Alice" requests a new GDPR export
    And "Alice" downloads the GDPR export
    And "Alice" logs out
  