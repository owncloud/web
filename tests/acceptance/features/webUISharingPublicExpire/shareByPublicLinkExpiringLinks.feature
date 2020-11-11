@mailhog @public_link_share-feature-required @ocis-reva-issue-64
Feature: Share by public link
  As a user
  I want to be able to set an expiry date on my public links
  So that I don't have to remember to unshare

  Background:
    Given user "user1" has been created with default attributes

  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | Public link      |
      | expireDate | 2038-10-14       |
    And user "user1" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing following
      | expireDate  | 2038 July 21  |
    Then the fields of the last public link share response of user "user1" should include
      | expireDate | 2038-07-21 |

  Scenario: user tries to change the expiration date of the public link to past date using webUI
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | Public link      |
      | expireDate | 2038-10-14       |
    And user "user1" has logged in using the webUI
    When the user tries to edit expiration of the public link named "Public link" of file "lorem.txt" to past date "2019 October 10"
    Then the fields of the last public link share response of user "user1" should include
      | expireDate | 2038-10-14 |

  @issue-ocis-reva-41
  Scenario Outline: auto set expiration date on public link (with default amount of expiry days)
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "user1" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | user1              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
      | expiration  | +7                 |
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-ocis-reva-41
  Scenario Outline: auto set expiration date on public link (with set amount expiry days)
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "42"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "user1" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | user1              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
      | expiration  | +42                |
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-ocis-reva-41
  Scenario: expiry date is set to enforced max expiry date when creating a public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "7"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user tries to create a new public link for resource "simple-folder" which expires in "+15" days using the webUI
    Then the expiration date shown on the webUI should be "+7" days
    And user "user1" should not have created any shares

  @issue-ocis-reva-41
  Scenario: user cannot change the expiry date of an existing public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has created a public link with following settings
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +6          |
    And user "user1" has logged in using the webUI
    When the user tries to edit expiration of the public link named "Public link" of file "lorem.txt" to past date "+15 days"
    Then user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +6          |

  @issue-ocis-reva-41
  Scenario: user cannot change the expiry date of an existing public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "16"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has created a public link with following settings
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +16          |
    And user "user1" has logged in using the webUI
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "7"
    When the user edits the public link named "Public link" of file "lorem.txt" changing following
      | expireDate | +15 |
    Then the user should see an error message on the public link share dialog saying "Cannot set expiration date more than 7 days in the future"
    Then user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +16         |

  @issue-ocis-reva-41
  Scenario: user can set an expiry date when creating a public link to a date that is before the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for resource "lorem.txt" using the webUI with
      | expireDate | +7 |
    Then user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +7          |

  @issue-ocis-reva-41
  Scenario: user can change the expiry date of an existing public link to a date that is before the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has created a public link with following settings
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +5          |
    And user "user1" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing following
      | expireDate | +7 |
    Then user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +7          |
