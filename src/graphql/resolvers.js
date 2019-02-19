const resolvers = {
  Query: {
    region: (obj, args, context, info) => {
      console.log(' obj', obj)
      console.log('args', args)
      console.log('context', context)
      console.log('info', info)
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
