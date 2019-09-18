import test from 'ava'
import { Client } from '..'

const client = new Client({
  accountId: '',
  region: '',
  accessKeyId: '',
  accessKeySecret: '',
  keepAlive: true
})

export { client, test }
