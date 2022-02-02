@ocis-reva-issue-41
Feature: disable sharing
  As an admin
  I want to be able to disable the sharing function
  So that users cannot share files

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server

  @smokeTest
  Scenario: Users tries to share via WebUI when Sharing is disabled
    Given the setting "shareapi_enabled" of app "core" has been set to "no" in the server
    When user "Alice" logs in using the webUI
    Then it should not be possible to share folder "simple-folder" using the webUI


  Scenario: Users tries to share from favorites page when sharing is disabled
    Given the setting "shareapi_enabled" of app "core" has been set to "no" in the server
    And user "Alice" has favorited element "lorem.txt" in the server
    And user "Alice" has favorited element "simple-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the favorites page
    Then it should not be possible to share folder "simple-folder" using the webUI
    And it should not be possible to share file "lorem.txt" using the webUI

  @issue-2459
  Scenario: Check file presence in shared-with-me page when sharing is disabled
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Alice" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice" in the server
    And the setting "shareapi_enabled" of app "core" has been set to "no" in the server
    When user "Brian" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI
#    And the link for "shared-with-me" page should not be available in files page menu
    When the user browses to the shared-with-me page
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI

  @issue-2459
  Scenario: Check file presence in shared-with-others page when Sharing is disabled
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And the setting "shareapi_enabled" of app "core" has been set to "no" in the server
    When user "Alice" logs in using the webUI
    #    Then the link for "shared-with-others" page should not be available in files page menu
    And the user browses to the shared-with-others page
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
