Feature: Mark file as favorite

  As a user
  I would like to mark any file/folder as favorite
  So that I can find my favorite file/folder easily

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest
  Scenario: mark files as favorites
    When the user marks file "data.tar.gz" as favorite using the webUI
    And the user marks file "data.zip" as favorite using the webUI
    Then file "data.tar.gz" should be marked as favorite on the webUI
    And file "data.zip" should be marked as favorite on the webUI
    When the user reloads the current page of the webUI
    Then file "data.tar.gz" should be marked as favorite on the webUI
    And file "data.zip" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then there should be 2 files/folders listed on the webUI
    And file "data.zip" should be listed on the webUI
    And file "data.zip" should be marked as favorite on the webUI
    And file "data.tar.gz" should be listed on the webUI
    And file "data.tar.gz" should be marked as favorite on the webUI
    And file "lorem.txt" should not be listed on the webUI

  Scenario: mark folders as favorites
    When the user marks folder "simple-folder" as favorite using the webUI
    And the user marks folder "strängé नेपाली folder" as favorite using the webUI
    Then folder "simple-folder" should be marked as favorite on the webUI
    And folder "strängé नेपाली folder" should be marked as favorite on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should be marked as favorite on the webUI
    And folder "strängé नेपाली folder" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then folder "simple-folder" should be listed on the webUI
    And folder "simple-folder" should be marked as favorite on the webUI
    And folder "strängé नेपाली folder" should be listed on the webUI
    And folder "strängé नेपाली folder" should be marked as favorite on the webUI
    But folder "simple-folder-empty" should not be listed on the webUI

  Scenario: navigate to an empty favorites page
    When the user browses to the favorites page
    Then the files table should be displayed
    And no message should be displayed on the webUI
    And there should be no files/folders listed on the webUI

  Scenario: navigate to the favorites page using the menu
    Given user "user1" has favorited element "data.zip"
    When the user browses to the favorites page using the webUI
    Then there should be 1 files/folders listed on the webUI
    And file "data.zip" should be listed on the webUI

  Scenario: navigate to the favorites page and back to files page using the menu
    Given the user has browsed to the favorites page using the webUI
    When the user browses to the files page using the webUI
    Then there should be 31 files/folders listed on the webUI

  @issue-1194
  @skip @yetToImplement
  Scenario: mark files with same name and different path as favorites and list them in favourites page
    When the user marks file "lorem.txt" as favorite using the webUI
    And the user marks folder "simple-empty-folder" as favorite using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user marks file "lorem.txt" as favorite using the webUI
    And the user marks folder "simple-empty-folder" as favorite using the webUI
    And the user browses to the files page
    And the user opens folder "strängé नेपाली folder" using the webUI
    And the user marks file "lorem.txt" as favorite using the webUI
    Then file "lorem.txt" with path "/" should be listed in the favorites page on the webUI
    And file "lorem.txt" with path "/simple-folder" should be listed in the favorites page on the webUI
    And folder "simple-empty-folder" with path "/" should be listed in the favorites page on the webUI
    And file "simple-empty-folder" with path "/simple-folder" should be listed in the favorites page on the webUI
    And file "lorem.txt" with path "/strängé नेपाली folder" should be listed in the favorites page on the webUI
