export default app => {
  return {
    Query: {
      statisticsCatalog: async (obj, args) => {
        return app.service('catalog/statistics').find({ query: args })
      },
      measuresCatalog: async (obj, args) => {
        return app.service('catalog/measures').find({ query: args })
      }
    }
  }
}
