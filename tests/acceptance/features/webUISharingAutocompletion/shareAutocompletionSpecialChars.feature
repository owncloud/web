Feature: Autocompletion of share-with names
  As a user
  I want to share files, with minimal typing, to the right people or groups
  So that I can efficiently share my files with other users or groups

Background:
  Given these users have been created with default attributes but not initialized:
    | username    |
    | regularuser |
  And these users have been created but not initialized:
    | username  | password  | displayname     | email          |
    | two       | %regular% | User Two        | u2@oc.com.np   |
    | u444      | %regular% | Four            | u3@oc.com.np   |
  And these groups have been created:
    | groupname     |
    | finance1      |
    | finance2      |
  And the setting "outgoing_server2server_share_enabled" of app "files_sharing" has been set to "no"

Scenario Outline: autocompletion of user having special characters in their usernames
  Given these users have been created but not initialized:
    | username   | password  | displayname     | email             |
    | <username> | %regular% | SpecialUser     | usrmail@oc.com.np |
  And user "regularuser" has logged in using the webUI
  And the user has browsed to the files page
  And the user has opened the share dialog for file "data.zip"
  And the user opens the share creation dialog in the webUI
  When the user types "<search>" in the share-with-field
  Then only users and groups that contain the string "<search>" in their name or displayname should be listed in the autocomplete list on the webUI
  Examples:
    | username | search |
    | @-_.     | @-     |
    | -_.ocusr | -_     |
    | ocusr-_. | oc     |
    | _ocusr@  | _u     |

Scenario Outline: autocompletion of user having special characters in their displaynames
  Given these users have been created but not initialized:
    | username   | password  | displayname     | email             |
    | normalusr  | %regular% | <displayName>   | msrmail@oc.com.np |
  And user "regularuser" has logged in using the webUI
  And the user has browsed to the files page
  And the user has opened the share dialog for file "data.zip"
  And the user opens the share creation dialog in the webUI
  When the user types "<search>" in the share-with-field
  Then only users and groups that contain the string "<search>" in their name or displayname should be listed in the autocomplete list on the webUI
    Examples:
    | displayName | search |
    | -_.ocusr    | -_     |
    | ocusr-_.    | oc     |
    | _ocusr@     | _u     |

Scenario Outline: autocompletion of groups having special characters in their names
  Given these groups have been created:
    | groupname |
    | <group>   |
  And user "regularuser" has logged in using the webUI
  And the user has browsed to the files page
  And the user has opened the share dialog for file "data.zip"
  And the user opens the share creation dialog in the webUI
  When the user types "<search>" in the share-with-field
  Then only users and groups that contain the string "<search>" in their name or displayname should be listed in the autocomplete list on the webUI
    Examples:
    | group    | search |
    | @-_.     | @-     |
    | -_.ocgrp | -_     |
    | ocgrp-_. | oc     |
    | _ocgrp@  | _u     |
