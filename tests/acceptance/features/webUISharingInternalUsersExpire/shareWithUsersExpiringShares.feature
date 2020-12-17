@ocis-reva-issue-64
Feature: Sharing files and folders with internal users with expiry date
  As a user
  I want to be able to set an expiry date on my shares
  So that I don't have to remember to unshare

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  @issue-4169
  Scenario: share a file with another internal user which should expire after 2 days
    Given user "user1" has logged in using the webUI
    When the user shares file "testimage.jpg" with user "User Two" which expires in "+2" days using the webUI
    And user "user2" accepts the share "testimage.jpg" offered by user "user1" using the sharing API
    Then user "user2" should have received a share with target "Shares/testimage.jpg" and expiration date in 2 days

  @issue-4169
  Scenario: share a file with another internal user with default expiration date
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And default expiration date for users is set to 3 days
    And user "user1" has logged in using the webUI
    When the user shares file "testimage.jpg" with user "User Two" using the webUI
    And user "user2" accepts the share "testimage.jpg" offered by user "user1" using the sharing API
    Then user "user2" should have received a share with target "Shares/testimage.jpg" and expiration date in 3 days

  @issue-4169
  Scenario: change existing expiration date of an existing share with another internal user
    Given user "user1" has created a new share with following settings
      | path       | lorem.txt |
      | shareWith  | user2     |
      | expireDate | +14       |
    And user "user2" has accepted the share "lorem.txt" offered by user "user1"
    And user "user1" has logged in using the webUI
    When the user edits the collaborator expiry date of "User Two" of file "lorem.txt" to "+7" days using the webUI
    Then user "user2" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days
    And user "user1" should have a share with these details:
      | field       | value             |
      | path        | /lorem.txt        |
      | file_target | /Shares/lorem.txt |
      | share_type  | user              |
      | uid_owner   | user1             |
      | share_with  | user2             |
      | expiration  | +7                |

  @issue-4169
  Scenario: share a resource with another internal user with expiration date within enforced maximum expiration date
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "5"
    And user "user1" has logged in using the webUI
    When the user shares file "lorem.txt" with user "User Two" which expires in "+4" days using the webUI
    And user "user2" accepts the share "lorem.txt" offered by user "user1" using the sharing API
    Then user "user1" should have a share with these details:
      | field       | value             |
      | path        | /lorem.txt        |
      | file_target | /Shares/lorem.txt |
      | share_type  | user              |
      | uid_owner   | user1             |
      | share_with  | user2             |
      | expiration  | +4                |

  @issue-4169
  Scenario Outline: share a resource with another internal user with expiration date beyond enforced maximum expiration date
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "5"
    And user "user1" has logged in using the webUI
    When the user tries to share resource "<shared-resource>" with user "User Two" which expires in "+6" days using the webUI
    Then the expiration date shown on the webUI should be "+5" days
    And user "user1" should not have created any shares
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-4169
  Scenario Outline: edit a share with another internal user changing expiration date within enforced maximum expiration date
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "5"
    And user "user1" has created a new share with following settings
      | path       | <shared-resource> |
      | shareWith  | user2             |
      | expireDate | +4                |
    And user "user1" has logged in using the webUI
    When the user tries to edit the collaborator expiry date of "User Two" of resource "<shared-resource>" to "+7" days using the webUI
    Then the expiration date shown on the webUI should be "+4" days
    And it should not be possible to save the pending share on the webUI
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-4169
  Scenario: user cannot concurrently update the role and date of a share after the system maximum expiry date has been reduced
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "30"
    And user "user1" has created a new share with following settings
      | path             | lorem.txt |
      | shareWith        | user2     |
      | expireDate       | +30       |
      | permissionString | read      |
    And user "user1" has logged in using the webUI
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "10"
    When the user tries to edit the collaborator "User Two" of file "lorem.txt" changing following
      | expireDate       | +15    |
      | permissionString | Editor |
    Then the user should see an error message on the collaborator share dialog saying "Cannot set expiration date more than 10 days in the future"
    And user "user1" should have a share with these details:
      | field       | value      |
      | path        | /lorem.txt |
      | share_type  | user       |
      | uid_owner   | user1      |
      | share_with  | user2      |
      | expiration  | +30        |
      | permissions | read       |

  @issue-4169
  Scenario: user cannot update the date of a share after the system maximum expiry date has been reduced
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "30"
    And user "user1" has created a new share with following settings
      | path       | lorem.txt |
      | shareWith  | user2     |
      | expireDate | +30       |
    And user "user1" has logged in using the webUI
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "10"
    When the user tries to edit the collaborator "User Two" of file "lorem.txt" changing following
      | expireDate | +15 |
    Then the user should see an error message on the collaborator share dialog saying "Cannot set expiration date more than 10 days in the future"
    And user "user1" should have a share with these details:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | user       |
      | uid_owner  | user1      |
      | share_with | user2      |
      | expiration | +30        |

  @issue-3174 @issue-4169
  Scenario Outline: enforced expiry date for group affect user shares
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "10"
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "5"
    And user "user1" has logged in using the webUI
    When the user tries to share resource "<shared-resource>" with user "User Two" which expires in "+6" days using the webUI
    Then the expiration date shown on the webUI should be "+5" days
#    Then the expiration date shown on the webUI should be "+6" days
#    Then user "user1" should have a share with these details:
#      | field      | value             |
#      | path       | <shared-resource> |
#      | share_type | user              |
#      | uid_owner  | user1             |
#      | share_with | user2             |
#      | expiration | +6                |
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-3174 @issue-4169
  Scenario Outline: enforced expiry date for users affect group sharess
    Given group "grp1" has been created
    And user "user2" has been added to group "grp1"
    And the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "5"
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "10"
    And user "user1" has logged in using the webUI
    When the user tries to share resource "<shared-resource>" with group "grp1" which expires in "+6" days using the webUI
    Then the expiration date shown on the webUI should be "+5" days
#    Then the expiration date shown on the webUI should be "+6" days
#    Then user "user1" should have a share with these details:
#      | field      | value             |
#      | path       | <shared-resource> |
#      | share_type | group             |
#      | uid_owner  | user1             |
#      | share_with | grp1              |
#      | expiration | +6                |
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-4169
  Scenario: change existing expiration date of an existing share to a date beyond the enforced maximum expiry date
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "7"
    And user "user1" has created a new share with following settings
      | path       | lorem.txt |
      | shareWith  | user2     |
      | expireDate | +7        |
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user tries to edit the collaborator expiry date of "User Two" of resource "lorem.txt" to "+14" days using the webUI
    Then the expiration date field should be marked as required on the WebUI
    And the expiration date for "+14 days" should be disabled on the WebUI
    And the expiration date shown on the webUI should be "+7" days
    And it should not be possible to save the pending share on the webUI

  @issue-4169
  Scenario: setting default expiration date and enforcing it does not change the expiration date of a previously created share
    Given user "user1" has created a new share with following settings
      | path      | lorem.txt |
      | shareWith | user2     |
    And the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "7"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    When user "user1" logs in using the webUI
    Then the share "lorem.txt" shared with user "User Two" should have no expiration information displayed on the WebUI

  @issue-4169
  Scenario: setting default expiration date and enforcing it does not change the expiration date of a previously created share which is beyond the new maximum date(enforced)
    Given user "user1" has created a new share with following settings
      | path       | lorem.txt |
      | shareWith  | user2     |
      | expireDate | +14       |
    And the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_user_share" of app "core" has been set to "7"
    And the setting "shareapi_enforce_expire_date_user_share" of app "core" has been set to "yes"
    When user "user1" logs in using the webUI
    Then the expiration information displayed on the WebUI of share "lorem.txt" shared with user "User Two" should be "Expires in 15 days" or "Expires in 14 days"
