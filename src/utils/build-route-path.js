// test regex = /users/:id
// test regex 2 = /users/:userId/groups/:groupId
export function buildRoutePath(path) {
  const routeParamsRegex = /:([a-zA-Z]+)/g

  console.log(Array.from(path.matchAll(routeParamsRegex)))
}