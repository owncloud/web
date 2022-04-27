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














  @issue-ocis-1328
  Scenario Outline: auto set expiration date on public link (with default amount of expiry days)
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And user "Alice" has created <element> "<shared-resource>" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | Alice              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
      | expiration  | +7                 |
    Examples:
      | element | shared-resource |
      | file    | lorem.txt       |
      | folder  | simple-folder   |

  @issue-ocis-1328
  Scenario Outline: auto set expiration date on public link (with set amount expiry days)
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "42" in the server
    And user "Alice" has created <element> "<shared-resource>" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | Alice              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
      | expiration  | +42                |
    Examples:
      | element | shared-resource |
      | file    | lorem.txt       |
      | folder  | simple-folder   |

  @issue-ocis-1328
  Scenario: expiry date is set to enforced max expiry date when creating a public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "7" in the server
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user tries to create a new public link for resource "simple-folder" which expires in "+15" days using the webUI
    Then the link expiration date shown on the webUI should be "+7" days
    And user "Alice" should not have created any shares in the server

  @issue-ocis-1328
  Scenario: user cannot change the expiry date of an existing public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +6          |
    And user "Alice" has logged in using the webUI
    When the user tries to edit expiration of the public link named "Public link" of file "lorem.txt" to past date "+15 days"
    Then user "Alice" should have a share with these details in the server:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | Alice       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +6          |

  @issue-ocis-1328
  Scenario: user cannot change the expiry date on existing public link to a date past the enforced max expiry date once max expiry date is changed
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "16" in the server
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +16         |
    And user "Alice" has logged in using the webUI
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "7" in the server
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "+15"
    And user "Alice" should have a share with these details in the server:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | Alice       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +16         |



  @issue-ocis-1328
  Scenario: user can set an expiry date when creating a public link to a date that is before the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "lorem.txt" using the webUI with
      | expireDate | +7 |
    Then user "Alice" should have a share with these details in the server:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | Alice       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +7          |

  @issue-ocis-1328
  Scenario: user can change the expiry date of an existing public link to a date that is before the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes" in the server
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +5          |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing expireDate to "+7"
    Then user "Alice" should have a share with these details in the server:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | Alice       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +7          |
