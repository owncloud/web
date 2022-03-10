Feature: Session storage for public link
  As a public
  I should be able to save the session of the public link files page
  So that I can easily access my files

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  Scenario: Public accesses the public link files page and refreshes the page
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Public accesses the public link files page in a new session after visiting once (folder share)
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Public accesses the public link files page in a new session after visiting once (file share)
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has shared folder "lorem.txt" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Public link author changes the password when the public is in public link files page session (folder share)
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI
    And user "Alice" changes the password of last public link  to "newpass" using the Sharing API in the server
    When the user reloads the current page of the webUI
    Then the password input for the public link should appear on the webUI
    When the user accesses the public link with password "newpass" using the webUI
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Public link author changes the password when the public is in public link files page session (file share)
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has shared folder "lorem.txt" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI
    And user "Alice" changes the password of last public link  to "newpass" using the Sharing API in the server
    When the user reloads the current page of the webUI
    Then the password input for the public link should appear on the webUI
    When the user accesses the public link with password "newpass" using the webUI
    Then file "lorem.txt" should be listed on the webUI
