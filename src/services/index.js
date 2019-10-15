import regions from './regions'
import genesapi from './genesapi'
import genesapiRawQuery from './genesapiRawQuery'

import csv from './csv'

export default app => {
  app.configure(regions)
  app.configure(genesapi)
  app.configure(genesapiRawQuery)
  app.configure(csv)
}
