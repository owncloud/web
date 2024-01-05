Feature: share

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Brian" logs in
    # disabling auto accepting to check accepting share
    And "Brian" disables auto-accepting using API

  Scenario: folder
    Given "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name                   |
      | folder_to_shared       |
      | folder_to_customShared |
      | shared_folder          |
    And "Alice" opens the "files" app
    And "Alice" uploads the following resource
      | resource      | to                     |
      | lorem.txt     | folder_to_shared       |
      | lorem-big.txt | folder_to_customShared |
    When "Alice" shares the following resource using the sidebar panel
      | resource               | recipient | type | role                                  | resourceType |
      | folder_to_shared       | Brian     | user | Can edit                              | folder       |
      | shared_folder          | Brian     | user | Can edit                              | folder       |
      | folder_to_customShared | Brian     | user | custom_permissions:read,create,delete | folder       |

    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name                   |
      | folder_to_shared       |
      | folder_to_customShared |
    Then "Brian" should not see a sync status for the folder "shared_folder"
    When "Brian" accepts the following share from the context menu
      | name          |
      | shared_folder |
    And "Brian" creates quick link of the resource "shared_folder" with password "%public%" from the context menu
    And "Brian" declines the following share from the context menu
      | name          |
      | shared_folder |
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource        | to                     |
      | simple.pdf      | folder_to_shared       |
      | testavatar.jpeg | folder_to_customShared |
    When "Brian" deletes the following resources using the sidebar panel
      | resource      | from                   |
      | lorem-big.txt | folder_to_customShared |
    And "Alice" opens the "files" app
    And "Alice" uploads the following resource
      | resource          | to               | option  |
      | PARENT/simple.pdf | folder_to_shared | replace |
    And "Brian" should not see the version of the file
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    And "Alice" removes following sharee
      | resource               | recipient |
      | folder_to_customShared | Brian     |
    When "Alice" deletes the following resources using the sidebar panel
      | resource         | from             |
      | lorem_new.txt    | folder_to_shared |
      | folder_to_shared |                  |
    And "Alice" logs out
    Then "Brian" should not be able to see the following shares
      | resource               | owner        |
      | folder_to_customShared | Alice Hansen |
      | folder_to_shared       | Alice Hansen |
    And "Brian" logs out


  Scenario: file
    Given "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource            | type       | content   |
      | shareToBrian.txt    | txtFile    | some text |
      | shareToBrian.md     | mdFile     | readme    |
      | shareToBrian.drawio | drawioFile |           |
      | sharedFile.txt      | txtFile    | some text |
    And "Alice" uploads the following resource
      | resource        |
      | testavatar.jpeg |
      | simple.pdf      |
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role                                 | resourceType |
      | shareToBrian.txt | Brian     | user | Can edit                             | file         |
      | shareToBrian.md  | Brian     | user | Can edit                             | file         |
      | testavatar.jpeg  | Brian     | user | Can view                             | file         |
      | simple.pdf       | Brian     | user | custom_permissions:read,update,share | file         |
      | sharedFile.txt   | Brian     | user | Can edit                             | file         |

    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    Then "Brian" should not see a sync status for the file "shareToBrian.txt"
    When "Brian" accepts the following share
      | name             |
      | shareToBrian.txt |
      | shareToBrian.md  |
      | testavatar.jpeg  |
      | simple.pdf       |
    Then "Brian" should not see a sync status for the file "sharedFile.txt"
    When "Brian" accepts the following share from the context menu
      | name           |
      | sharedFile.txt |
    And "Brian" creates quick link of the resource "sharedFile.txt" with password "%public%" from the context menu
    And "Brian" declines the following share from the context menu
      | name           |
      | sharedFile.txt |
    And "Brian" edits the following resources
      | resource         | content            |
      | shareToBrian.txt | new content        |
      | shareToBrian.md  | new readme content |
    And "Brian" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpeg |
    And "Brian" closes the file viewer
    And "Brian" opens the following file in pdfviewer
      | resource   |
      | simple.pdf |
    And "Brian" closes the file viewer
    And "Alice" removes following sharee
      | resource         | recipient |
      | shareToBrian.txt | Brian     |
      | shareToBrian.md  | Brian     |
    And "Alice" logs out
    Then "Brian" should not be able to see the following shares
      | resource         | owner        |
      | shareToBrian.txt | Alice Hansen |
      | shareToBrian.md  | Alice Hansen |
    And "Brian" logs out


  Scenario: share with expiration date
    Given "Admin" creates following group using API
      | id    |
      | sales |
    And "Admin" adds user to the group using API
      | user  | group |
      | Brian | sales |
    And  "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name       |
      | myfolder   |
      | mainFolder |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content      |
      | new.txt    | some content |
    And "Alice" opens the "files" app
    When "Alice" shares the following resource using the sidebar panel
      | resource   | recipient | type  | role     | resourceType | expirationDate |
      | new.txt    | Brian     | user  | Can edit | file         | +5 days        |
      | myfolder   | sales     | group | Can view | folder       | +10 days       |
      | mainFolder | Brian     | user  | Can edit | folder       |                |

    # set expirationDate to existing share
    And "Alice" sets the expiration date of share "mainFolder" of user "Brian" to "+5 days"
    And "Alice" sets the expiration date of share "myfolder" of group "sales" to "+3 days"
    And  "Alice" logs out

    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name       |
      | new.txt    |
      | myfolder   |
      | mainFolder |
    And "Brian" logs out
