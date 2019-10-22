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
