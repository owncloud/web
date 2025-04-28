@predefined-users
Feature: Users can create shortcuts for resources and sites

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |

  Scenario: shortcut
    When "Alice" creates the following folders in personal space using API
      | name |
      | docs |
    And "Alice" creates the following files into personal space using API
      | pathToFile      | content           |
      | docs/notice.txt | important content |
    And "Alice" uploads the following local file into personal space using API
      | localFile                     | to             |
      | filesForUpload/testavatar.jpg | testavatar.jpg |
    And "Alice" shares the following resource using API
      | resource       | recipient | type | role     |
      | testavatar.jpg | Brian     | user | Can view |
    And "Alice" creates a public link of following resource using API
      | resource        | password |
      | docs/notice.txt | %public% |
    And "Alice" logs in
    And "Alice" renames the most recently created public link of resource "docs/notice.txt" to "myPublicLink"
    And "Alice" opens the "files" app

    # create a shortcut to file folder website
    And "Alice" creates a shortcut for the following resources
      | resource                   | name           | type    |
      | notice.txt                 | important file | file    |
      | docs                       |                | folder  |
      | https://owncloud.com/news/ | companyNews    | website |

    And "Alice" downloads the following resources using the sidebar panel
      | resource           | type |
      | important file.url | file |

    When "Alice" opens a shortcut "important file.url"
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    And "Alice" opens the "files" app
    Then "Alice" can open a shortcut "companyNews.url" with external url "https://owncloud.com/news/"
    And "Alice" logs out

    # create a shortcut to the shared file
    When "Brian" logs in
    And "Brian" creates a shortcut for the following resources
      | resource       | name | type |
      | testavatar.jpg | logo | file |
    And "Brian" opens a shortcut "logo.url"
    Then "Brian" is in a media-viewer
    And "Brian" closes the file viewer

    # create a shortcut to the public link
    When "Brian" opens the "files" app
    And "Brian" creates a shortcut for the following resources
      | resource     | name             | type        |
      | myPublicLink | linkToNoticeFile | public link |
    And "Brian" opens a shortcut "linkToNoticeFile.url"
    And "Brian" unlocks the public link with password "%public%"
    Then "Brian" is in a text-editor
    And "Brian" logs out
