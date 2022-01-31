@public_link_share-feature-required
Feature: Create public link shares
  As a user
  I want to share files through a publicly accessible link
  So that users who do not have an account on my ownCloud server can access them

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI

  Scenario: Sharing the share_folder as public link is not possible
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens the link share dialog for folder "Shares" using the webUI
    Then the link share permission denied message should be displayed in the sharing dialog on the webUI
