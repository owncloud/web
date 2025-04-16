import { UsersEnvironment } from '../../support/environment'

export const getValue = (pattern): string => {
  switch (pattern) {
    case '%public%':
      return 'Pwd:12345'
    default:
      pattern = pattern.replace(/%/g, '')
      const [type, userKey, property] = pattern.split('_')
      if (type === 'user') {
        if (!property) {
          throw new Error('Invalid user property: ' + pattern)
        }
        const usersEnvironment = new UsersEnvironment()
        const user = usersEnvironment.getCreatedUser({ key: userKey })
        return user[property]
      }
  }
}

export const substitute = (text: string): string => {
  const regex = /%[A-Za-z0-9_-]+%/g
  const matches = text.match(regex)
  console.log(matches)
  if (matches) {
    for (const match of matches) {
      const value = getValue(match)
      text = text.replace(match, value)
    }
  }
  return text
}
