Feature: File Upload

  As a user
  I would like to be able to upload files via the WebUI
  So that I can store files in ownCloud

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file with content "initial content" to "lorem.txt" in the server
    And user "Alice" has uploaded file with content "initial content" to "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"
