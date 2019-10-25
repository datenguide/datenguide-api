import measures from './measures'
import schema from './schema'
import statistics from './statistics'

export default app => {
  app.configure(measures)
  app.configure(schema)
  app.configure(statistics)
}
