@public_link_share-feature-required
Feature: Edit public link shares
  As a user
  I want to edit public share
  So that I can manage the the shares

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  @issue-ocis-1328
  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |
