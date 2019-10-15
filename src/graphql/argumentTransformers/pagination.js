import _ from 'lodash'

const transformPaginationArguments = args => {
  const result = _.mapKeys(
    args,
    (value, key) => ({ page: '$skip', itemsPerPage: '$limit' }[key] || key)
  )
  delete result.total
  return result
}

export default transformPaginationArguments
