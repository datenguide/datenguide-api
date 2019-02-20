const resolvers = {
  Query: {
    // eslint-disable-next-line
    region: (obj, args, context, info) => {
      return {
        name: 'region'
      }
    },
    regions: () => [
      {
        name: 'region1'
      },
      {
        name: 'region2'
      }
    ]
  }
}

export default resolvers
