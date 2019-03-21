import _ from 'lodash'

const transformRegionArguments = args =>
  _.mapKeys(args, (value, key) => (key === 'id' || key === 'ids' ? 'region_id' : key))

export default transformRegionArguments
