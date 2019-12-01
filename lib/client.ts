import _ from 'lodash'
import * as crypto from 'crypto'

import * as types from './types'

import {
  requestRetry,
  getEndpoint,
  toXMLBuffer,
  parseXML,
  extract,
  getCanonicalizedMNSHeaders,
  getResponseHeaders,
} from './helper'

export default class Client {
  accountId: string
  accessKeyID: string
  accessKeySecret: string
  region: string
  endpointDomain: string
  endpoint: string
  keepAlive: boolean
  retries: number

  constructor(configs: {
    accountId: string
    region: string
    accessKeyId: string
    accessKeySecret: string
    secure?: boolean
    internal?: boolean
    vpc?: boolean
    keepAlive?: boolean
    retries?: number
  }) {
    this.accountId = configs.accountId
    this.accessKeyID = configs.accessKeyId
    this.accessKeySecret = configs.accessKeySecret
    this.region = configs.region
    const { domain, endpoint } = getEndpoint(
      configs.accountId,
      configs.region,
      configs.secure,
      configs.internal,
      configs.vpc,
    )
    this.endpointDomain = domain
    this.endpoint = endpoint
    this.keepAlive = !!configs.keepAlive
    this.retries = configs.retries || 3
  }

  // Queue
  async createQueue(params: types.CreateQueueRequest): Promise<types.CreateQueueResponse> {
    const body = toXMLBuffer('Queue', params.Attributes)
    const url = `/queues/${params.QueueName}`
    const response = await this.request('PUT', url, 'Queue', body, { responseHeader: ['location'] })
    return { Location: response.headers.location }
  }

  async deleteQueue(params: types.DeleteQueueRequest): Promise<void> {
    await this.request('DELETE', `/queues/${params.QueueName}`, 'Queue', '')
  }

  async listQueue(params?: types.ListQueueRequest): Promise<types.ListQueueResponse> {
    const customHeaders = {}
    if (params && params.Start) {
      customHeaders['x-mns-marker'] = params.Start
    }
    if (params && params.Limit) {
      customHeaders['x-mns-ret-number'] = params.Limit
    }
    if (params && params.Prefix) {
      customHeaders['x-mns-prefix'] = params.Prefix
    }
    const response = await this.request('GET', '/queues', 'Queues', '', {
      customHeaders,
    })
    return response.body
  }

  async getQueueAttributes(
    params: types.GetQueueAttributesRequest,
  ): Promise<types.GetQueueAttributesResponse> {
    const response = await this.request('GET', `/queues/${params.QueueName}`, 'Queue', '')
    return response.body
  }

  async setQueueAttributes(params: types.SetQueueAttributesRequest): Promise<void> {
    const body = toXMLBuffer('Queue', params.Attributes)
    const url = `/queues/${params.QueueName}?metaoverride=true`
    await this.request('PUT', url, 'Queue', body)
  }

  // Message
  async sendMessage(params: types.SendMessageRequest): Promise<types.SendMessageResponse> {
    const url = `/queues/${params.QueueName}/messages`
    const body = toXMLBuffer('Message', params.Payloads)
    const response = await this.request('POST', url, 'Message', body)
    return response.body
  }

  async batchSendMessage(
    params: types.BatchSendMessageRequest,
  ): Promise<types.SendMessageResponse[]> {
    const url = `/queues/${params.QueueName}/messages`
    const subType = 'Message'
    const body = toXMLBuffer('Messages', params.Entries, subType)
    const response = await this.request('POST', url, 'Messages', body)
    return response.body.Message
  }

  async receiveMessage(params: types.ReceiveMessageRequest): Promise<types.ReceiveMessageResponse> {
    let url = `/queues/${params.QueueName}/messages`
    if (params.WaitSeconds) {
      url += `?waitseconds=${params.WaitSeconds}`
    }
    // 31000 31s +1s max waitSeconds is 30s
    const response = await this.request('GET', url, 'Message', '', { timeout: 31000 })
    return response.body
  }

  async batchReceiveMessage(
    params: types.BatchReceiveMessageRequest,
  ): Promise<types.ReceiveMessageResponse[]> {
    let url = `/queues/${params.QueueName}/messages?numOfMessages=${params.NumOfMessages}`
    if (params.WaitSeconds) {
      url += `&waitseconds=${params.WaitSeconds}`
    }
    const response = await this.request('GET', url, 'Messages', '', { timeout: 31000 })
    return response.body.Message
  }

  async peekMessage(params: types.PeekMessageRequest): Promise<types.PeekMessageResponse> {
    const response = await this.request(
      'GET',
      `/queues/${params.QueueName}/messages?peekonly=true`,
      'Message',
      '',
    )
    return response.body
  }

  async batchPeekMessage(
    params: types.BatchPeekMessageRequest,
  ): Promise<types.PeekMessageResponse[]> {
    const url =
      `/queues/${params.QueueName}/messages?` +
      `peekonly=true&numOfMessages=${params.NumOfMessages}`
    const response = await this.request('GET', url, 'Messages', '')
    return response.body.Message
  }

  async deleteMessage(params: types.DeleteMessageRequest): Promise<void> {
    const url = `/queues/${params.QueueName}/messages?ReceiptHandle=${params.ReceiptHandle}`
    await this.request('DELETE', url, 'Message', '')
  }

  async batchDeleteMessage(
    params: types.BatchDeleteMessageRequest,
  ): Promise<types.DeleteMessageResponse[] | void> {
    const body = toXMLBuffer('ReceiptHandles', params.ReceiptHandles, 'ReceiptHandle')
    const url = `/queues/${params.QueueName}/messages`
    const response = await this.request('DELETE', url, 'Errors', body)
    // 3种情况，普通失败，部分失败，全部成功
    if (response.body) {
      const subType = 'Error'
      // 部分失败
      return response.body[subType]
    }
  }

  async changeMessageVisibility(
    params: types.ChangeMessageVisibilityRequest,
  ): Promise<types.ChangeMessageVisibilityResponse> {
    const url =
      `/queues/${params.QueueName}/messages?` +
      `receiptHandle=${params.ReceiptHandle}&visibilityTimeout=${params.VisibilityTimeout}`
    const response = await this.request('PUT', url, 'ChangeVisibility', '')
    return response.body
  }

  // Topic
  async createTopic(params: types.CreateTopicRequest): Promise<types.CreateTopicResponse> {
    const body = toXMLBuffer('Topic', params.Attributes)
    const response = await this.request('PUT', `/topics/${params.TopicName}`, 'Topic', body, {
      responseHeader: ['location'],
    })
    return { Location: response.headers.location }
  }

  async deleteTopic(params: types.DeleteTopicRequest): Promise<void> {
    await this.request('DELETE', `/topics/${params.TopicName}`, 'Topic', '')
  }

  async listTopic(params: types.ListTopicRequest): Promise<types.ListTopicResponse> {
    const customHeaders = {}
    if (params && params.Start) {
      customHeaders['x-mns-marker'] = params.Start
    }
    if (params && params.Limit) {
      customHeaders['x-mns-ret-number'] = params.Limit
    }
    if (params && params.Prefix) {
      customHeaders['x-mns-prefix'] = params.Prefix
    }
    const response = await this.request('GET', '/topics', 'Topics', '', {
      customHeaders,
    })
    return response.body
  }

  async getTopicAttributes(
    params: types.GetTopicAttributesRequest,
  ): Promise<types.GetTopicAttributesResponse> {
    const response = await this.request('GET', `/topics/${params.TopicName}`, 'Topic', '')
    return response.body
  }

  async setTopicAttributes(params: types.SetTopicAttributesRequest): Promise<void> {
    const body = toXMLBuffer('Topic', params.Attributes)
    const url = `/topics/${params.TopicName}?metaoverride=true`
    await this.request('PUT', url, 'Topic', body)
  }

  // Subscription
  async subscribe(params: types.SubscribeRequest): Promise<types.SubscribeResponse> {
    const body = toXMLBuffer('Subscription', params.Attributes)
    const response = await this.request(
      'PUT',
      `/topics/${params.TopicName}/subscriptions/${params.SubscriptionName}`,
      'Subscription',
      body,
      { responseHeader: ['location'] },
    )
    return { Location: response.headers.location }
  }

  async unsubscribe(params: types.UnsubscribeRequest): Promise<void> {
    await this.request(
      'DELETE',
      `/topics/${params.TopicName}/subscriptions/${params.SubscriptionName}`,
      'Subscription',
      '',
    )
  }

  async listSubscriptionByTopic(
    params: types.ListSubscriptionByTopicRequest,
  ): Promise<types.ListSubscriptionResponse> {
    const customHeaders = {}
    if (params.Start) {
      customHeaders['x-mns-marker'] = params.Start
    }
    if (params.Limit) {
      customHeaders['x-mns-ret-number'] = params.Limit
    }
    if (params.Prefix) {
      customHeaders['x-mns-prefix'] = params.Prefix
    }
    const response = await this.request(
      'GET',
      `/topics/${params.TopicName}/subscriptions`,
      'Subscriptions',
      '',
      {
        customHeaders,
      },
    )
    return response.body
  }

  async getSubscriptionAttributes(
    params: types.GetSubscriptionAttributesRequest,
  ): Promise<types.GetSubscriptionAttributesResponse> {
    const response = await this.request(
      'GET',
      `/topics/${params.TopicName}/subscriptions/${params.SubscriptionName}`,
      'Subscription',
      '',
    )
    return response.body
  }

  async setSubscriptionAttributes(params: types.SetSubscriptionAttributesRequest): Promise<void> {
    const body = toXMLBuffer('Subscription', params.Attributes)
    const url = `/topics/${params.TopicName}/subscriptions/${params.SubscriptionName}?metaoverride=true`
    await this.request('PUT', url, 'Topic', body)
  }

  // Message
  async publishMessage(params: types.PublishMessageRequest): Promise<types.PublishMessageResponse> {
    const url = `/topics/${params.TopicName}/messages`
    const body = toXMLBuffer('Message', params.Payloads)
    const response = await this.request('POST', url, 'Message', body)
    return response.body
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
    const response = await requestRetry(
      url,
      {
        method,
        headers,
        body: requestBody,
        timeout: opts.timeout,
        resolveWithFullResponse: true,
        agentOptions: {
          keepAlive: this.keepAlive,
        },
      },
      this.retries,
    )

    const code = response.statusCode
    const contentType = response.headers['content-type'] || ''
    const responseBody = response.body

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
        err.name = extract(e.Code)
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
      body,
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
      date,
      host: this.endpointDomain,
      'x-mns-date': date,
      'x-mns-version': '2015-06-06',
      authorization: '',
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
    headers.authorization = `MNS ${this.accessKeyID}:${signature}`
    return headers
  }

  private sign(verb: string, headers: { [header: string]: string }, resource: string): string {
    const canonicalizedMNSHeaders = getCanonicalizedMNSHeaders(headers)
    const md5 = headers['content-md5'] || ''
    const date = headers.date
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
