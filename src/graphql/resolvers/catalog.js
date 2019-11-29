export default app => {
  return {
    Query: {
      statisticsCatalog: async (obj, args) => {
        return app.service('çatalog/statistics').find({ query: args })
      },
      measuresCatalog: async (obj, args) => {
        return app.service('catalog/measures').find({ query: args })
      }
    }
  }
}
