Feature: Session storage for public link
    As a public
    I should be able to save the session of the public link files page
    So that I can easily access my files

    Background:
        Given user "user1" has been created with default attributes

    Scenario: Public accesses the public link files page and refreshes the page
        Given user "user1" has shared folder "simple-folder" with link with "read" permissions and password "pass123"
        When the public tries to open the public link page of the last public link created by user "user1" with password "pass123"
        Then file "lorem.txt" should be listed on the webUI
        When the user reloads the current page of the webUI
        Then file "lorem.txt" should be listed on the webUI

    Scenario Outline: Public accesses the public link files page on a new session after visiting once
        Given user "user1" has shared folder "<share-path>" with link with "read" permissions and password "pass123"
        When the public tries to open the public link page of the last public link created by user "user1" with password "pass123"
        And the public opens the public link page of the last public link created by user "user1" on a new session
        Then the password input for the public link should appear in the webUI
        When the user accesses the public link with password "pass123" using the webUI
        Then file "lorem.txt" should be listed on the webUI
        Examples:
            | share-path    |
            | simple-folder |
            | lorem.txt     |

    Scenario Outline: Public link author changes the password when the public is in public link files page session
        Given user "user1" has shared folder "<share-path>" with link with "read" permissions and password "pass123"
        When the public tries to open the public link page of the last public link created by user "user1" with password "pass123"
        And user "user1" changes the password of last public link  to "newpass" using the Sharing API
        Then file "lorem.txt" should be listed on the webUI
        When the user reloads the current page of the webUI
        Then the password input for the public link should appear in the webUI
        When the user accesses the public link with password "newpass" using the webUI
        Then file "lorem.txt" should be listed on the webUI
        Examples:
            | share-path    |
            | simple-folder |
            | lorem.txt     |
