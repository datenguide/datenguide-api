export default app => {
  const lookups = {}

  const region = (obj, args, context, info) => {
    return {
      name: 'region'
    }
  }

  const regions = (obj, args, context, info) => {
    console.log('args', args)

    return [
      {
        name: 'region1'
      },
      {
        name: 'region2'
      }
    ]
  }

  return {
    Query: {
      region,
      regions
    }
  }
}
