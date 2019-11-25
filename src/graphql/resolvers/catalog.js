export default app => {
  return {
    Query: {
      statistics: async (obj, args) => {
        return app.service('çatalog/statistics').find({ query: args })
      },
      measures: async (obj, args) => {
        return app.service('catalog/measures').find({ query: args })
      }
    }
  }
}
