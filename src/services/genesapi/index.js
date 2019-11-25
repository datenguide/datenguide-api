import genesapiRaw from './genesapiRaw'
import genesapi from './genesapi'

export default app => {
  app.configure(genesapiRaw)
  app.configure(genesapi)
}
