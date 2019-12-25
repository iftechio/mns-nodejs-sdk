import * as _ from 'lodash'
import * as xml2js from 'xml2js'
import * as escape from 'xml-escape'
import * as requestPromise from 'request-promise-native'

export async function requestRetry(
  uri: string,
  options: requestPromise.RequestPromiseOptions,
  retries: number,
): Promise<any> {
  return requestPromise(uri, options).catch(err => {
    if (retries <= 0) {
      if (err.response) {
        return err.response
      }
      throw err.error
    }
    return requestRetry(uri, options, retries - 1)
  })
}

export async function parseXML(input: any): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(input, (err, obj) => {
      if (err) {
        return reject(err)
      }
      resolve(obj)
    })
  })
}

export function extract(arr: any) {
  if (arr && arr.length === 1 && typeof arr[0] === 'string') {
    return arr[0]
  }
  arr.forEach(item => {
    _.keys(item).forEach(key => {
      item[key] = extract(item[key])
    })
  })
  return arr
}

export function toXMLBuffer(entityType: string, params: any, subType?: string) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>'
  xml += `<${entityType} xmlns="http://mns.aliyuncs.com/doc/v1/">`
  if (Array.isArray(params)) {
    params.forEach(item => {
      xml += `<${subType}>`
      xml += _format(item)
      xml += `</${subType}>`
    })
  } else {
    xml += _format(params)
  }
  xml += `</${entityType}>`
  return Buffer.from(xml, 'utf8')
}

export async function getSecurityCredential(
  ramRole: string,
): Promise<{ AccessKeyId: string; AccessKeySecret: string }> {
  return requestPromise(
    `http://100.100.100.200/latest/meta-data/ram/security-credentials/${ramRole}`,
  )
}

export function getEndpoint(
  accountId: string,
  region: string,
  secure?: boolean,
  internal?: boolean,
  vpc?: boolean,
) {
  return {
    endpoint: `${secure ? 'https' : 'http'}://${accountId}.mns.${region}${
      internal ? '-internal' : ''
    }${vpc ? '-vpc' : ''}.aliyuncs.com`,
    domain: `${accountId}.mns.${region}${internal ? '-internal' : ''}${
      vpc ? '-vpc' : ''
    }.aliyuncs.com`,
  }
}

export function getCanonicalizedMNSHeaders(headers: { [header: string]: string }): string {
  return _.keys(headers)
    .filter(key => key.startsWith('x-mns-'))
    .sort()
    .map(key => `${key}:${headers[key]}\n`)
    .join('')
}

export function getResponseHeaders(
  headers: any,
  attentions: string[] | undefined,
): { [header: string]: string } {
  const result = {}
  _.forEach(attentions, key => {
    result[key] = headers[key]
  })
  return result
}

function _format(params: string | number | boolean | object): string {
  if (typeof params !== 'object') {
    return escape(params.toString())
  }
  let xml = ''
  _.keys(params).forEach(key => {
    const value = params[key]
    if (_.isNil(value)) {
      return
    }
    xml += `<${key}>${_format(value)}</${key}>`
  })
  return xml
}
