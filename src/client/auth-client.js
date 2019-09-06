export function createAuthClient (services) {
  const {router} = services
  const userUrl = router.buildPath('api.v1.user')

  return {
    fetchUser () {
      return fetch(userUrl).then(response => response.json())
    },
  }
}
