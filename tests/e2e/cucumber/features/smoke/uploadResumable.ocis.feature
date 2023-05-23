Feature: Upload
  As a user
  I want to upload resources
  So that I can store them in owncloud

  Scenario: Upload resources in personal space
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And the user creates a file "largefile.txt" with size "1GB" in the temp upload directory
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" starts uploading the following large resources from the temp upload directory
      | resource      |
      | largefile.txt |
    And "Alice" pauses the file upload
    And "Alice" cancels the file upload
    # issue: https://github.com/owncloud/web/issues/9080
    # Todo: uncomment when the issue is fixed
    # And "Alice" starts uploading the following large resources from the temp upload directory
    #   | resource      |
    #   | largefile.txt |
    # And "Alice" pauses the file upload
    # And "Alice" resumes the file upload
    And "Alice" logs out
