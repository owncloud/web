// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}
export const empty = {
  text: '',
  list: ['', '', '']
}
export const shareInviteCollaboratorHelp = {
  text: $gettext('Invite persons or groups to access this file or folder.'),
  list: [
    $gettext('Enter a name or group to share this item'),
    $gettext(
      'If you share a folder,  all of its contents and subfolders will be shared with the entered persons or groups'
    ),
    $gettext('Invited persons or groups will be notified via e-mail or in-app notification'),
    $gettext('Invited persons can not see who else has access')
  ]
}
export const shareInviteCollaboratorHelpCern = {
  list: [
    $gettext(
      'To search for service or secondary accounts prefix the username with "a:" (like "a:doe") and for guest accounts prefix the username with "l:" (like "l:doe")'
    )
  ]
}
export const shareSpaceAddMemberHelp = {
  text: $gettext('Add persons or groups as members to this Space. Members are allowed to:'),
  list: [
    $gettext('see who else is member of this space'),
    $gettext('view all files in this space'),
    $gettext('(if permitted) edit or delete files in this Space'),
    $gettext('(if permitted) share folders of this Space with non-Members'),
    $gettext('see with whom a folder is shared')
  ],
  endText: 'Members can only be added or removed by a Space Manager.'
}
export const shareViaLinkHelp = {
  text: $gettext('Share a file or folder by link. Choose how access is granted:'),
  list: [
    $gettext(
      'Only invited people can access: Only people from the list "Invited people" can access. If there is no list, no people are invited yet.'
    ),
    $gettext(
      'Everyone with the link: Everyone with the link can access. Note: If you share this link with people from the list "Invited people", they need to login-in so that their individual assigned permissions can take effect. If they are not logged-in, the permissions of the link take effect.'
    )
  ]
}
export const shareQuickLinkHelp = {
  text: $gettext('The Quick link is the link that is always copied if you'),
  list: [
    $gettext('right click on a file and choose "Get link" or'),
    $gettext('click on the quickaction "Get link"')
  ]
}
export const shareAddLinkHelp = {
  text: $gettext('Add and manage multiple links for the same file or folder.')
}
