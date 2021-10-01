Feature: Upload into a folder Shares
  This suite of tests describes different behavior in oCIS and os ownCloud10 with respect to 
  the folder "Shares".
  The folder "Shares" in oCIS is the mount point for all incoming shares so it is only used for reading  
  The folder "Shares" in ownCloud10 is a folder in which you can download or save files

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And user "Alice" has been created with default attributes and without skeleton files
    And user "Brian" has been created with default attributes and without skeleton files

  @issue-ocis-2322 
  Scenario: the Shares folder does not exist if no share has been accepted
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    When user "Alice" logs in using the webUI
    Then folder "Shares" should not be listed on the webUI

  @issue-ocis-2322 
  Scenario: the Shares folder exists after accepting the first shared file
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    When user "Alice" logs in using the webUI
    Then folder "Shares" should be listed on the webUI

  @issue-ocis-2322 @notToImplementOnOC10
  Scenario: try to upload a file or a folder into a folder Shares with all permissions in oCIS
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "lorem.txt" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    Then it should not be possible to create files using the webUI

  @issue-ocis-2322 @notToImplementOnOC10
  Scenario: try to upload a file or a folder into a folder Shares with read permissions in oCIS 
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "lorem.txt" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    Then it should not be possible to create files using the webUI

  @issue-ocis-2322 @notToImplementOnOCIS
  Scenario: upload of a file into a folder Shares in oc10
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI

  @issue-ocis-2322 @notToImplementOnOCIS
  Scenario: upload of a folder into a folder Shares in oc 10
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI

  @issue-ocis-2322 @notToImplementOnOCIS
  Scenario: create a new folder into a folder Shares in oc10
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user creates a folder with the name "New folder" using the webUI
    Then folder "New folder" should be listed on the webUI

  @issue-ocis-2322 @notToImplementOnOCIS
  Scenario: move a file or a folder into a folder Shares in oc10 
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    And user "Alice" has created folder "NewFolder"
    And user "Alice" has logged in using the webUI
    When the user moves folder "NewFolder" into folder "Shares" using the webUI 
    Then folder "NewFolder" should be listed on the webUI

  @issue-ocis-2322 @notToImplementOnOC10
  Scenario: try to move a file or a folder into a folder Shares in oCIS
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "lorem.txt" offered by user "Brian"
    And user "Alice" has created folder "NewFolder"
    And user "Alice" has logged in using the webUI
    When the user tries to move folder "NewFolder" into folder "Shares" using the webUI
    Then the move here folder button should be disabled

  @issue-ocis-2322 @notToImplementOnOCIS
  Scenario: the user can delete files that they wrote into the folder Shares
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And user "Alice" has created folder "Shares/NewFolder"
    And user "Alice" has uploaded file with content "some data" to "Shares/textfile.txt"
    And the user has opened folder "Shares"
    When the user deletes folder "NewFolder" using the webUI
    And the user deletes file "textfile.txt" using the webUI
    Then folder "NewFolder" should not be listed on the webUI
    And file "textfile.tx" should not be listed on the webUI
