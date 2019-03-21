import _ from 'lodash'

const transformPaginationArguments = args =>
  _.mapKeys(
    args,
    (value, key) => ({ page: '$skip', itemsPerPage: '$limit' }[key] || key)
  )

export default transformPaginationArguments
