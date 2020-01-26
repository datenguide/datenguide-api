import fs from 'fs'
import path from 'path'
import { createTestClient } from 'apollo-server-testing'

import app from '../../app'
import { createServer } from '../index'

const files = fs.readdirSync(path.join(__dirname, '__queries__'))

jest.setTimeout(5000000)

describe('GraphQL API', () => {
  let apolloQuery

  beforeAll(async () => {
    const server = await createServer(app)
    const { query } = createTestClient(server)
    apolloQuery = query
  })

  test.each(files)(
    'if fetches the correct data for query %p',
     async (file) => {
      const query = fs.readFileSync(path.join(__dirname, '__queries__', file), {
        encoding: 'utf8'
      })
      const result = apolloQuery({
        query
      })
      await expect(result).resolves.toMatchSnapshot()
    }
  )
})
