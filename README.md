# mns-nodejs-sdk

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage][cov-image]][cov-url]

[npm-image]: https://img.shields.io/npm/v/@alicloud/mns.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@alicloud/mns
[travis-image]: https://img.shields.io/travis/aliyun/mns-nodejs-sdk/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/aliyun/mns-nodejs-sdk.svg?branch=master
[cov-image]: https://coveralls.io/repos/aliyun/mns-nodejs-sdk/badge.svg?branch=master&service=github
[cov-url]: https://coveralls.io/github/aliyun/mns-nodejs-sdk?branch=master

Documents: http://doxmate.cool/aliyun/mns-nodejs-sdk/api.html


## Installation

```bash
npm install @ruguoapp/mns --save
```

## API Spec

See: https://help.aliyun.com/document_detail/27475.html

## Test

```sh
ACCOUNT_ID=<ACCOUNT_ID> ACCESS_KEY_ID=<ACCESS_KEY_ID> ACCESS_KEY_SECRET=<ACCESS_KEY_SECRET> make test
```

## Usage

```ts
import MNSClient from '@ruguoapp/mns'

const client = new MNSClient('<account id>',
  '<region>',
  '<access key id>',
  '<access key secret>',
  // optional & default
  {
    secure: false, // use https or http
    internal: false, // use internal endpoint
    vpc: false // use vpc endpoint
  }
);

(async function () {
  let res;
  // create queue
  res = await client.createQueue('<queue name>');
  console.log(res);
  // list queue
  res = await client.listQueue();
  console.log(JSON.stringify(res, null, 2));
  // create topic
  res = await client.createTopic('<topic name>');
  console.log(res);
  // get topic attributes
  res = await client.getTopicAttributes('<topic name>');
  console.log(res);
  // publish message
  res = await client.publishMessage('<topic name>', {
    MessageBody: 'content',
    MessageAttributes: {
      DirectSMS: JSON.stringify({
        FreeSignName: '',
        TemplateCode: '<template code>',
        Type: '<type>',
        Receiver: '<phone number>',
        SmsParams: JSON.stringify({
          code: '<code>',
          product: '<product>'
        })
      })
    }
  });
  console.log(res);
})().then((data) => {
  console.log(data);
}, (err) => {
  console.log(err.stack);
});
```

## License

The [MIT](LICENSE) License
