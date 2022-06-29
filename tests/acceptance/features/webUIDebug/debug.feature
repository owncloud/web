Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has been added to group "grp1" in the server


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Carol" in the server
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |
