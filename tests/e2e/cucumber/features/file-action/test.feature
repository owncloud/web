Feature: users management

  Scenario: user login can be managed in the admin settings
    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    # create group
    And "Admin" navigates to the groups management page
    When "Admin" creates the following groups
      | id       |
      | sales    |
      | security |
    Then "Admin" should see the following group
      | group    |
      | sales    |
      | security |

    # create users
    And "Admin" navigates to the users management page
    And "Admin" creates the following user
      | name | displayname | email            | password |
      | bob  | bob         | bob@owncloud.com | 123      |
      | mat  | mat         | mat@owncloud.com | 123      |
      | sam  | sam         | sam@owncloud.com | 123      |
      | tom  | tom         | tom@owncloud.com | 123      |

    # make bob as spaceadmin
    And "Admin" changes role to "Space Admin" for user "bob" using the sidebar panel

    # adds users to group
    And "Admin" navigates to the users management page
    When "Admin" adds the user "sam" to the groups "sales,security" using the sidebar panel
    # set logo
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the general management page
    Then "Admin" should be able to upload a logo from the local file "filesForUpload/testavatar.png"
    #gdpr
    And "Admin" opens the user menu
    And "Admin" requests a new GDPR export
    # And "Admin" downloads the GDPR export
    # language change
    # And "Admin" changes the language to "Deutsch - German"
    # Then "Admin" should see the following account page title "Mein Konto"
    And "Admin" logs out

    # Bob creates space and shares space/space resources
    When "Bob" logs in
    And "Bob" navigates to the projects space page
    And "Bob" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Bob" navigates to the project space "team.1"
    And "Bob" adds following users to the project space
      | user  | role     | kind  |
      | tom   | Can view | user  |
      | sales | Can edit | group |
    When "Bob" reloads the page
    And "Bob" navigates to the projects space page
    And "Bob" navigates to the project space "team.1"
    And "Bob" creates a public link for the space with password "%public%" using the sidebar panel
    And "Bob" renames the most recently created public link of space to "spaceLink"

    # team.1
    And "Bob" navigates to the project space "team.1"
    And "Bob" updates the space "team.1" name to "developer team"
    And "Bob" updates the space "team.1" subtitle to "developer team - subtitle"
    And "Bob" updates the space "team.1" description to "developer team - description"
    And "Bob" updates the space "team.1" quota to "50"
    And "Bob" updates the space "team.1" image to "testavatar.png"

    # shared examples
    And "Bob" creates the following resources
      | resource         | type   |
      | folderPublic     | folder |
      | folder_to_shared | folder |
    And "Bob" uploads the following resources
      | resource  | to               |
      | lorem.txt | folderPublic     |
      | lorem.txt | folder_to_shared |

    And "Bob" creates a public link of following resource using the sidebar panel
      | resource     | role     | password |
      | folderPublic | Can edit | %public% |
    And "Bob" renames the most recently created public link of resource "folderPublic" to "team.1"
    And "Bob" sets the expiration date of the public link named "team.1" of resource "folderPublic" to "+5 days"
    When "Bob" shares the following resource using the sidebar panel
      | resource         | recipient | type  | role     | resourceType |
      | folder_to_shared | Mat       | user  | Can edit | folder       |
      | folder_to_shared | sales     | group | Can edit | folder       |
    And "Bob" logs out


    When "Sam" logs in
    When "Sam" creates the following resources
      | resource         | type         | content              |
      | OpenDocument.odt | OpenDocument | OpenDocument Content |
    And "Sam" creates a public link of following resource using the sidebar panel
      | resource         | role     | password |
      | OpenDocument.odt | Can edit | %public% |
    # And "Sam" opens the following file in Collabora
    #   | resource         |
    #   | OpenDocument.odt |
    # When "Sam" creates the following resources
    #   | resource           | type           | content                |
    #   | MicrosoftWord.docx | Microsoft Word | Microsoft Word Content |
    # And "Sam" creates a public link of following resource using the sidebar panel
    #   | resource           | role     | password |
    #   | MicrosoftWord.docx | Can edit | %public% |
    # And "Sam" shares the following resource using API
    #   | resource           | recipient | type  | role     |
    #   | MicrosoftWord.docx | sales     | group | Can edit |
    #   | OpenDocument.odt   | mat       | user  | Can edit |
    And "Sam" logs out