export default app => {
  return {
    Query: {
      statistics: async (obj, args) => {
        return app.service('statistics').find({ query: args })
      },
      measures: async (obj, args) => {
        return app.service('measures').find({ query: args })
      }
    }
  }
}
