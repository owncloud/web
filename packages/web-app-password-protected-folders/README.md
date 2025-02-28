# web-app-password-protected-folders

This web extension enhances the oCIS platform by allowing users to create password-protected folders (PPF). It provides an additional layer of security for sensitive or confidential information stored within oCIS.

Note that this extension is default included and enabled in oCIS and not explicitly shown as extension in the webUI.

## Features

- 🔒 Create password-protected folders within oCIS
- 🔑 Set unique passwords for each protected folder
- 🎨 Seamless integration with the oCIS user interface

## Usage

Users can create password-protected folders by following these steps:

1. Log in to your oCIS instance.
1. Select a Space and navigate into a location where you want to create a password-protected folder.
1. Click the **New** button and select **Password Protected Folder**.
1. Enter a name for the folder and set a unique password.
1. Click **Create** to create the password-protected folder.
1. To access the protected folder, users will be prompted to enter the set password.

## How it Works

1. When a PPF is created, it creates in reality a file with a special hidden extension (.psec) and only contains an URL with a password protected share pointing to the target folder.
1. Opening the link file via the oCIS web interface initiates access to the PPF automatically. Password protected share rules apply.
1. The target folder for the PPF is ALWAYS created as **subfolder** mirroring the original path of the link folder in a hidden folder located in the root of the private space of the PPF creator. This means he normally does not see the target folder except showing hidden files is enabled in his private space. Do not change or delete this folder except you know what you are doing.
1. The link file and target folder have the same name.
1. If the **owner** of the PPF deletes the **link file**, it also deletes the target folder with its content automatically.
1. The deletion of a PPF moves the link file and the target folder into the respective trashbin of the space.

## Considerations

1. **PPF Location**

   When creating a PPF in a Space, the created link file inherits the permissions defined for the user who is granted access to the space. This has some managing and security implications to consider:

   1. Though possible, do not create a PPF in your private Space for security reasons. You would need to share the Space or link file first. Exposing all the personal Space publicly is a security issue for your personal data.
   1. If you create a PPF in a project Space where users also have delete permissions, **Any** accessing user with delete permission would be able to delete the link file. Accidentially or intentionally done, no one would be possible to access the PPF anymore though the data of the target folder still exists.
   1. As suggestion for a secure environment accessing PPF's, it is recommended to create an own project Space only for PPF's where added users only have view permissions. Space managers or defined users can or will have extended permissions though. This guarantees that users that are allowed accessing the Space wont be able to delete or manipulate link files "accidentially".  

1. **Restoring a Deleted a PPF**

   It is most important to understand that resources are not accessed by their name but their internal UNIQUE ID (UUID).

   1. If a PPF got deleted by the creator, both the link file and the target folder get moved to the trashbin of their respective Space. Though you can restore both, the PPF will no longer work as the underlaying UUID has changed.
   1. To recreate a deleted PPF (with the same name), you must exactly follow the described steps below:
      1. If not already done, the PPF creator needs to enable showing hidden files in his private Space.
      1. Undelete the target folder from the trashbin.
      1. Rename the restored target folder, the name MUST NOT be the same as it was before.
      1. DO NOT undelete the link file from the project Space!! This file can finally be deleted.
      1. Create a new PPF. You can now use the former PPF name because the original target folder restored has a different name now.
      1. Copy or move any data from the restored and renamed target folder into the fresh created target folder.
      1. Delete the renamed target folder, it is not needed any more.
      1. If wanted, prevent showing hidden files in the personal Space again and prevent them from being viewed.

1. **Moving or Renaming a Link File**

   Moving or renaming a link file is prevented by the webUI, but you could copy this file or manipulate it via the webUI if permission allows or via one of the Desktop, iOS or Android apps if `.psec` files are not excluded from the sync list. Some things need to be considered for this case:
   
   1. Link files and the target folder share the same path. When the owner deletes a moved, renamed or copied link file, it will remove the link file but not the target folder because it does not have a valid mirrored path anymore to the target folder and cant find it. This operation fails silently and nothing gets reported.
   1. A deletion of a manipulated link file requires a manual deletion of the target folder. If this step is ommitted,  it can be a cause of orphaned data!!
