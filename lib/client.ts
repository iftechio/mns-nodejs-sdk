import * as _ from 'lodash'
import * as requestPromise from 'request-promise-native'
import * as crypto from 'crypto'

const request = requestPromise.defaults({})

import {
  getEndpoint,
  toXMLBuffer,
  parseXML,
  extract,
  getCanonicalizedMNSHeaders,
  getResponseHeaders,
} from './helper'

type Response = {
  code: number
  headers: { [header: string]: string }
  body: any
}

export default class Client {
  accountid: string
  accessKeyID: string
  accessKeySecret: string
  endpointDomain: string
  endpoint: string

  constructor(
    accountid: string,
    region: string,
    accessKeyId: string,
    accessKeySecret: string,
    opts = {
      secure: false,
      internal: false,
      vpc: false,
    },
  ) {
    this.accountid = accountid
    this.accessKeyID = accessKeyId
    this.accessKeySecret = accessKeySecret
    const { domain, endpoint } = getEndpoint(accountid, region, opts)
    this.endpointDomain = domain
    this.endpoint = endpoint
  }

  // Queue
  async createQueue(
    queueName: string,
    params?: {
      DelaySeconds?: number
      MaximumMessageSize?: number
      MessageRetentionPeriod?: number
      VisibilityTimeout?: number
      PollingWaitSeconds?: number
      LoggingEnabled?: boolean
    },
  ): Promise<Response> {
    const body = toXMLBuffer('Queue', params)
    const url = `/queues/${queueName}`
    return this.request('PUT', url, 'Queue', body, { responseHeader: ['location'] })
  }

  async deleteQueue(queueName: string): Promise<Response> {
    return this.request('DELETE', `/queues/${queueName}`, 'Queue', '')
  }

  async listQueue(params?: { start?: string; limit?: number; prefix?: string }): Promise<Response> {
    const customHeaders = {}
    if (params && params.start) {
      customHeaders['x-mns-marker'] = params.start
    }
    if (params && params.limit) {
      customHeaders['x-mns-ret-number'] = params.limit
    }
    if (params && params.prefix) {
      customHeaders['x-mns-prefix'] = params.prefix
    }
    return this.request('GET', '/queues', 'Queues', '', {
      customHeaders,
    })
  }

  async getQueueAttributes(queueName: string): Promise<Response> {
    return this.request('GET', `/queues/${queueName}`, 'Queue', '')
  }

  async setQueueAttributes(
    queueName,
    params?: {
      DelaySeconds?: number
      MaximumMessageSize?: number
      MessageRetentionPeriod?: number
      VisibilityTimeout?: number
      PollingWaitSeconds?: number
      LoggingEnabled?: boolean
    },
  ): Promise<Response> {
    const body = toXMLBuffer('Queue', params)
    const url = `/queues/${queueName}?metaoverride=true`
    return this.request('PUT', url, 'Queue', body)
  }

  // Message
  async sendMessage(
    queueName: string,
    params: {
      MessageBody: string
      DelaySeconds?: number
      Priority?: number
    },
  ): Promise<Response> {
    const url = `/queues/${queueName}/messages`
    const body = toXMLBuffer('Message', params)
    return this.request('POST', url, 'Message', body)
  }

  async batchSendMessage(
    queueName,
    params: {
      MessageBody: string
      DelaySeconds?: number
      Priority?: number
    }[],
  ): Promise<Response> {
    const url = `/queues/${queueName}/messages`
    const subType = 'Message'
    const body = toXMLBuffer('Messages', params, subType)
    return this.request('POST', url, 'Messages', body)
  }

  async receiveMessage(queueName: string, waitSeconds?: number): Promise<Response> {
    let url = `/queues/${queueName}/messages`
    if (waitSeconds) {
      url += `?waitseconds=${waitSeconds}`
    }

    // 31000 31s +1s max waitSeconds is 30s
    return this.request('GET', url, 'Message', '', { timeout: 31000 })
  }

  async batchReceiveMessage(
    queueName: string,
    numOfMessages: number,
    waitSeconds?: number,
  ): Promise<Response> {
    let url = `/queues/${queueName}/messages?numOfMessages=${numOfMessages}`
    if (waitSeconds) {
      url += `&waitseconds=${waitSeconds}`
    }
    return this.request('GET', url, 'Messages', '', { timeout: 31000 })
  }

  async peekMessage(queueName: string): Promise<Response> {
    return this.request('GET', `/queues/${queueName}/messages?peekonly=true`, 'Message', '')
  }

  async batchPeekMessage(queueName: string, numOfMessages: number): Promise<Response> {
    const url = `/queues/${queueName}/messages?` + `peekonly=true&numOfMessages=${numOfMessages}`
    return this.request('GET', url, 'Messages', '')
  }

  async deleteMessage(queueName: string, receiptHandle: string): Promise<Response> {
    const url = `/queues/${queueName}/messages?ReceiptHandle=${receiptHandle}`
    return this.request('DELETE', url, 'Message', '')
  }

  async batchDeleteMessage(queueName: string, receiptHandles: string[]): Promise<Response> {
    const body = toXMLBuffer('ReceiptHandles', receiptHandles, 'ReceiptHandle')
    const url = `/queues/${queueName}/messages`
    const response = await this.request('DELETE', url, 'Errors', body)
    // 3种情况，普通失败，部分失败，全部成功
    if (response.body) {
      const subType = 'Error'
      // 部分失败
      response.body = response.body[subType]
    }
    return response
  }

  async changeMessageVisibility(
    queueName: string,
    receiptHandle: string,
    visibilityTimeout: number,
  ): Promise<Response> {
    const url =
      `/queues/${queueName}/messages?` +
      `receiptHandle=${receiptHandle}&visibilityTimeout=${visibilityTimeout}`
    return this.request('PUT', url, 'ChangeVisibility', '')
  }

  // Topic
  async createTopic(
    topicName: string,
    params?: {
      MaximumMessageSize?: number
      LoggingEnabled?: boolean
    },
  ): Promise<Response> {
    const body = toXMLBuffer('Topic', params)
    return this.request('PUT', `/topics/${topicName}`, 'Topic', body, {
      responseHeader: ['location'],
    })
  }

  async deleteTopic(topicName: string): Promise<Response> {
    return this.request('DELETE', `/topics/${topicName}`, 'Topic', '')
  }

  async listTopic(params?: { start?: string; limit?: number; prefix?: string }): Promise<Response> {
    const customHeaders = {}
    if (params && params.start) {
      customHeaders['x-mns-marker'] = params.start
    }
    if (params && params.limit) {
      customHeaders['x-mns-ret-number'] = params.limit
    }
    if (params && params.prefix) {
      customHeaders['x-mns-prefix'] = params.prefix
    }
    return this.request('GET', '/topics', 'Topics', '', {
      customHeaders,
    })
  }

  async getTopicAttributes(topicName: string): Promise<Response> {
    return this.request('GET', `/topics/${topicName}`, 'Topic', '')
  }

  async setTopicAttributes(
    topicName: string,
    params?: {
      MaximumMessageSize?: number
      LoggingEnabled?: boolean
    },
  ): Promise<Response> {
    const body = toXMLBuffer('Topic', params)
    const url = `/topics/${topicName}?metaoverride=true`
    return this.request('PUT', url, 'Topic', body)
  }

  // Subscription
  async subscribe(
    topicName: string,
    subscriptionName: string,
    params: {
      Endpoint: string
      FilterTag?: string
      NotifyStrategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY'
      NotifyContentFormat?: 'XML' | 'JSON' | 'SIMPLIFIED'
    },
  ): Promise<Response> {
    const body = toXMLBuffer('Subscription', params)
    return this.request(
      'PUT',
      `/topics/${topicName}/subscriptions/${subscriptionName}`,
      'Subscription',
      body,
      { responseHeader: ['location'] },
    )
  }

  async unsubscribe(topicName: string, subscriptionName: string): Promise<Response> {
    return this.request(
      'DELETE',
      `/topics/${topicName}/subscriptions/${subscriptionName}`,
      'Subscription',
      '',
    )
  }

  async listSubscriptionByTopic(
    topicName: string,
    params?: { start?: string; limit?: number; prefix?: string },
  ): Promise<Response> {
    const customHeaders = {}
    if (params && params.start) {
      customHeaders['x-mns-marker'] = params.start
    }
    if (params && params.limit) {
      customHeaders['x-mns-ret-number'] = params.limit
    }
    if (params && params.prefix) {
      customHeaders['x-mns-prefix'] = params.prefix
    }
    return this.request('GET', `/topics/${topicName}/subscriptions`, 'Subscriptions', '', {
      customHeaders,
    })
  }

  async getSubscriptionAttributes(topicName: string, subscriptionName: string): Promise<Response> {
    return this.request(
      'GET',
      `/topics/${topicName}/subscriptions/${subscriptionName}`,
      'Subscription',
      '',
    )
  }

  async setSubscriptionAttributes(
    topicName: string,
    subscriptionName: string,
    params?: {
      NotifyStrategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY'
    },
  ): Promise<Response> {
    const body = toXMLBuffer('Subscription', params)
    const url = `/topics/${topicName}/subscriptions/${subscriptionName}?metaoverride=true`
    return this.request('PUT', url, 'Topic', body)
  }

  // Message
  async publishMessage(
    topicName: string,
    params: {
      MessageBody: string
      MessageTag?: string
      MessageAttributes?: string
    },
  ): Promise<Response> {
    const url = `/topics/${topicName}/messages`
    const body = toXMLBuffer('Message', params)
    return this.request('POST', url, 'Message', body)
  }

  private async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    resource: string,
    type: string,
    requestBody: string | Buffer,
    opts: {
      customHeaders?: { [header: string]: string }
      responseHeader?: string[]
      timeout?: number
    } = {},
  ) {
    const url = `${this.endpoint}${resource}`
    const headers = this.buildHeaders(method, requestBody, resource, opts.customHeaders)
    const response = await request(url, {
      method,
      headers,
      body: requestBody,
      timeout: opts.timeout,
      resolveWithFullResponse: true,
    }).catch(err => err.response)

    const code = response.statusCode
    const contentType = response.headers['content-type'] || ''
    const responseBody = response.body
    console.log(responseBody)

    let body
    if (
      responseBody &&
      (contentType.startsWith('text/xml') || contentType.startsWith('application/xml'))
    ) {
      const responseData = await parseXML(responseBody)
      if (responseData.Error) {
        const e = responseData.Error
        const message = extract(e.Message)
        const requestid = extract(e.RequestId)
        const hostid = extract(e.HostId)
        const err = new Error(
          `${method} ${url} failed with ${code}. ` +
            `requestid: ${requestid}, hostid: ${hostid}, message: ${message}`,
        )
        err.name = 'MNS' + extract(e.Code) + err.name
        throw err
      }

      body = {}
      _.keys(responseData[type]).forEach(key => {
        if (key !== '$') {
          body[key] = extract(responseData[type][key])
        }
      })
    }

    return {
      code,
      headers: getResponseHeaders(response.headers, opts.responseHeader),
      body: body,
    }
  }

  private buildHeaders(
    method: string,
    body: string | Buffer,
    resource: string,
    customHeaders?: { [header: string]: string },
  ): { [header: string]: string } {
    const date = new Date().toUTCString()

    let headers = {
      date: date,
      host: this.endpointDomain,
      'x-mns-date': date,
      'x-mns-version': '2015-06-06',
    }

    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = 'text/xml'
      const md5 = crypto
        .createHash('md5')
        .update(body)
        .digest('base64')
      headers = _.assign(headers, {
        'content-length': body.length,
        'content-type': contentType,
        'content-md5': md5,
      })
    }

    headers = _.assign(headers, customHeaders)
    const signature = this.sign(method, headers, resource)
    headers['authorization'] = `MNS ${this.accessKeyID}:${signature}`
    return headers
  }

  private sign(verb: string, headers: { [header: string]: string }, resource: string): string {
    const canonicalizedMNSHeaders = getCanonicalizedMNSHeaders(headers)
    const md5 = headers['content-md5'] || ''
    const date = headers['date']
    const type = headers['content-type'] || ''
    // Signature = base64(hmac-sha1(VERB + "\n"
    //             + CONTENT-MD5 + "\n"
    //             + CONTENT-TYPE + "\n"
    //             + DATE + "\n"
    //             + CanonicalizedMNSHeaders
    //             + CanonicalizedResource))
    const toSignString = `${verb}\n${md5}\n${type}\n${date}\n${canonicalizedMNSHeaders}${resource}`
    return crypto
      .createHmac('sha1', this.accessKeySecret)
      .update(toSignString)
      .digest('base64')
  }
}
