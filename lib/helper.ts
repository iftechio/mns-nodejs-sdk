import * as _ from 'lodash'
import * as xml2js from 'xml2js'

export function parseXML(input: any): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(input, (err, obj) => {
      if (err) {
        return reject(err)
      }
      resolve(obj)
    })
  })
}

export function extract(arr) {
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

export function getEndpoint(
  accountid: string,
  region: string,
  opts: {
    secure: boolean
    internal: boolean
    vpc: boolean
  },
) {
  const protocol = opts.secure ? 'https' : 'http'
  if (opts.internal) {
    region += '-internal'
  }
  if (opts.vpc) {
    region += '-vpc'
  }
  return {
    endpoint: `${protocol}://${accountid}.mns.${region}.aliyuncs.com`,
    domain: `${accountid}.mns.${region}.aliyuncs.com`,
  }
}

export function getCanonicalizedMNSHeaders(headers) {
  return _.keys(headers)
    .filter(key => key.startsWith('x-mns-'))
    .sort()
    .map(key => `${key}:${headers[key]}\n`)
    .join('')
}

export function getResponseHeaders(headers, attentions) {
  const result = {}
  _.forEach(attentions, key => {
    result[key] = headers[key]
  })
  return result
}

function _format(params) {
  if (typeof params === 'string') {
    return params
  }
  let xml = ''
  _.keys(params).forEach(key => {
    const value = params[key]
    if (typeof value === 'object') {
      xml += `<${key}>${_format(value)}</${key}>`
    } else {
      xml += `<${key}>${value}</${key}>`
    }
  })
  return xml
}