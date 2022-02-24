Feature: Create public link to folder
  As a user
  I want to share folder resources through a publicly accessible link with role
  So that unauthorized user can access the public link based on role set

  Background:
    Given the following users have been created
      | Alice |

  Scenario: Alice creates public link to a folder
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following folder
      | folderPublic |
    And "Alice" uploads the following resource
      | resource  | to           |
      | lorem.txt | folderPublic |
    Then "Alice" should see the following resource
      | folderPublic/lorem.txt |
    When "Alice" creates a public link to the following resource via the sidebar panel
      | resource     | name         | role     | dateOfExpiration | password |
      | folderPublic | myPublicLink | uploader | +5 days          | 12345    |
    Then "Alice" should see 1 public link
