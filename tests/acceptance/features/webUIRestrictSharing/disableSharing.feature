Feature: disable sharing
  As an admin
  I want to be able to disable the sharing function
  So that users cannot share files

  Background:
    Given user "user1" has been created with default attributes

  @smokeTest
  Scenario: Users tries to share via WebUI when Sharing is disabled
    Given the setting "shareapi_enabled" of app "core" has been set to "no"
    When user "user1" logs in using the webUI
    Then it should not be possible to share folder "simple-folder" using the webUI

  Scenario: Users tries to share from favorites page when sharing is disabled
    Given the setting "shareapi_enabled" of app "core" has been set to "no"
    And user "user1" has favorited element "lorem.txt"
    And user "user1" has favorited element "simple-folder"
    And user "user1" has logged in using the webUI
    When the user browses to the favorites page
    Then it should not be possible to share folder "simple-folder" using the webUI
    And it should not be possible to share file "lorem.txt" using the webUI

  Scenario: Check file presence from shared-with-me page when sharing is disabled
    Given user "user2" has been created with default attributes
    And user "user2" has shared file "lorem.txt" with user "user1"
    And user "user2" has shared folder "simple-folder" with user "user1"
    And the setting "shareapi_enabled" of app "core" has been set to "no"
    When user "user1" logs in using the webUI
    Then file "lorem (2).txt" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI
    When the user browses to the shared-with-me page
    Then file "lorem (2).txt" should not be listed on the webUI
    And folder "simple-folder (2)" should not be listed on the webUI

  Scenario: Check file presence from shared-with-others page when Sharing is disabled
    Given user "user2" has been created with default attributes
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And the setting "shareapi_enabled" of app "core" has been set to "no"
    And user "user1" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
