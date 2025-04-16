@predefined-users
Feature: Upload large resources
  As a user
  I want to upload large resources
  So that I can pause and resume the upload

  Scenario: Upload large resources in personal space
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And the user creates a file "largefile.txt" of "1GB" size in the temp upload directory
    And "Alice" logs in
    When "Alice" starts uploading the following large resources from the temp upload directory
      | resource      |
      | largefile.txt |
    And "Alice" pauses the file upload
    And "Alice" cancels the file upload
    Then following resources should not be displayed in the files list for user "Alice"
      | resource      |
      | largefile.txt |
    When "Alice" starts uploading the following large resources from the temp upload directory
      | resource      |
      | largefile.txt |
    And "Alice" pauses the file upload
    And "Alice" resumes the file upload
    Then following resources should be displayed in the files list for user "Alice"
      | resource      |
      | largefile.txt |
    And "Alice" logs out
