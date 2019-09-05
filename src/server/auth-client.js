export function createAuthClient (services) {
  const {request} = services

  return {
    async fetchUser () {
      await new Promise(resolve => setTimeout(resolve, 300))

      const {userId} = request.signedCookies

      if (userId === '111') return {id: 111, name: 'Amy A.', username: 'amy'}
      if (userId === '222') return {id: 222, name: 'Bob B.', username: 'bob'}

      return null
    },
  }
}
