@mailhog @public_link_share-feature-required
Feature: Share by public link
  As a user
  I want to be able to set an expiry date on my public links
  So that I don't have to remember to unshare

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |


  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | 2038-10-14  |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "2038 July 21"
    Then the last public link share response of user "Alice" should include the following fields in the server
      | expireDate | 2038-07-21 |
