import catalog from './catalog'
import genesapi from './genesapi'

export default app => {
  app.configure(genesapi)
  app.configure(catalog)
}
