# Reshare permission is not available now in the oCIS webUI
Feature: Resharing shared files with different permissions
  As a user
  I want to reshare received files and folders with other users with different permissions
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |

  @issue-4193
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for original sharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Viewer" with permissions "," using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And the user re-logs in as "Brian" using the webUI
    Then user "Carol King" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @skipOnOC10
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for original sharer (ocis bug demonstration)
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Viewer" with permissions "," using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And the user re-logs in as "Brian" using the webUI
    Then user "Carol King" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read                  |

  @issue-4193
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for the receiver
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Viewer" with permissions "," using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @skipOnOC10
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for the receiver ( ocis bug demonstration)
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Viewer" with permissions "," using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read                  |

  @issue-product-270
  Scenario Outline: share a file/folder without share permissions and check if another user can reshare
    Given user "Brian" has shared folder "<shared-entry-name>" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "<shared-entry-name>" offered by user "Brian"
    When user "Alice" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share resource "<shared-entry-name>" using the webUI
    Examples:
      | shared-entry-name |
      | simple-folder     |
      | lorem.txt         |



  @issue-product-270
  Scenario Outline: share a received file/folder without share permissions and check if another user can reshare
    Given user "Brian" has shared folder "<shared-entry-name>" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "<shared-entry-name>" offered by user "Brian"
    And user "Alice" has shared folder "/Shares/<shared-entry-name>" with user "Carol" with "read" permissions
    And user "Carol" has accepted the share "<shared-entry-name>" offered by user "Alice"
    When user "Carol" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share resource "<shared-entry-name>" using the webUI
    Examples:
      | shared-entry-name |
      | simple-folder     |
      | lorem.txt         |

  @issue-ocis-1743
  Scenario: User is allowed to reshare a file/folder with the equivalent received permissions, and collaborators should not be listed for the receiver
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Advanced permissions" with permissions "share, delete" using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And the user re-logs in as "Carol" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then the current collaborators list should have order "Brian Murphy,Carol King"
    And user "Brian Murphy" should be listed as "Owner" reshared through "Alice Hansen" in the collaborators list on the webUI
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | share, delete, read   |

  @issue-product-270 @issue-4193
  Scenario: User is allowed to reshare a file/folder with the lesser permissions, and check if it is listed for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Advanced permissions" with permissions "delete" using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And the user re-logs in as "Brian" using the webUI
    Then user "Alice Hansen" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Carol King" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "delete" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | delete, read          |

  @issue-product-270
  Scenario: User is not allowed to reshare a file/folder with the higher permissions
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user shares folder "simple-folder" with user "Carol King" as "Advanced permissions" with permissions "share, delete, update" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And as "Carol" folder "Shares/simple-folder" should not exist
    And user "Carol" should not have received any shares


  Scenario: Reshare a file and folder from shared with me page
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    And the user has browsed to the shared-with-me page
    When the user shares folder "simple-folder" with user "Carol King" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "Carol King" as "Editor" using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Brian" using the sharing API
    And user "Carol" accepts the share "lorem.txt" offered by user "Brian" using the sharing API
    Then as "Carol" folder "/Shares/simple-folder" should exist
    And as "Carol" file "/Shares/lorem.txt" should exist


  Scenario: Reshare a file and folder from shared with others page
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the shared-with-others page
    When the user shares folder "simple-folder" with user "Carol King" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "Carol King" as "Editor" using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    And user "Carol" accepts the share "lorem.txt" offered by user "Alice" using the sharing API
    Then as "Carol" folder "/Shares/simple-folder" should exist
    And as "Carol" file "/Shares/lorem.txt" should exist

  @ocis-reva-issue-39
  Scenario: Reshare a file and folder from favorites page
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Brian" has favorited element "/Shares/simple-folder"
    And user "Brian" has favorited element "/Shares/lorem.txt"
    And user "Brian" has logged in using the webUI
    When the user browses to the favorites page using the webUI
    And the user shares folder "Shares/simple-folder" with user "Carol King" as "Editor" using the webUI
    And the user shares file "Shares/lorem.txt" with user "Carol King" as "Editor" using the webUI
    And user "Carol" accepts the share "simple-folder" offered by user "Brian" using the sharing API
    And user "Carol" accepts the share "lorem.txt" offered by user "Brian" using the sharing API
    Then as "Carol" folder "/Shares/simple-folder" should exist
    And as "Carol" file "/Shares/lorem.txt" should exist


  Scenario: Resource owner sees resharer in collaborators list
    Given user "Carol" has been created with default attributes
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "/Shares/simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" reshared through "Brian Murphy" in the collaborators list on the webUI

  @ocis-reva-issue-34
  Scenario: Share recipient sees resharer in collaborators list
    Given user "Carol" has been created with default attributes
    And user "David" has been created with default attributes
    And group "Davidgrp" has been created
    And user "David" has been added to group "Davidgrp"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared folder "simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "/Shares/simple-folder" with user "David"
    And user "Carol" has shared folder "/Shares/simple-folder" with group "Davidgrp"
    And user "David" has accepted the share "simple-folder" offered by user "Brian"
    When user "David" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy, Carol King" in the collaborators list on the webUI