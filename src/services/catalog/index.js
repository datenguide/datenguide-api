import measures from './measures'
import schema from './schema'
import statistics from './statistics'
import treeApiSchema from './treeApiSchema'
import regions from './regions'

export default app => {
  app.configure(schema)
  app.configure(measures)
  app.configure(statistics)
  app.configure(treeApiSchema)
  app.configure(regions)
}
