Feature: Share by public link with different roles
    As a user
    I want to share files through a publicly accessible link with different roles
    So that users who do not have an account on my ownCloud server can access them

    As an admin
    I want to limit the ability of a user to share files/folders through a publicly accessible link
    So that public sharing is limited according to organization policy

    Background:
        Given user "Alice" has been created with default attributes and without skeleton files in the server
        And user "Alice" has created folder "simple-folder" in the server


    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"


    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

    Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
        Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
        When the public uses the webUI to access the last public link created by user "Alice" in a new session
        And the public uploads file "'single'quotes.txt" in files-drop page
        And the public uploads file "new-lorem.txt" in files-drop page
        Then the following files should be listed on the files-drop page:
            | 'single'quotes.txt |
            | new-lorem.txt      |
        And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
        And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"