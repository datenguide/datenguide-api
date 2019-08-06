import _ from 'lodash'

const transformRegionArguments = args =>
  _.mapKeys(
    args,
    (value, key) => ({ id: 'region_id', ids: 'region_id' }[key] || key)
  )

export default transformRegionArguments
