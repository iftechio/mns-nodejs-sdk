# mns-nodejs-sdk

Documents: http://doxmate.cool/aliyun/mns-nodejs-sdk/api.html


## Installation

```bash
npm install @ruguoapp/mns --save
```

## API Spec

See: https://help.aliyun.com/document_detail/27475.html

## Test

```sh
npm test
```

## Usage

```ts
import MNSClient from '@ruguoapp/mns'

const client = new MNSClient({
    accountId: '<account id>',
    region: '<region>',
    accessKeyId: '<access key id>',
    accessKeySecret: '<access key secret>',
    // optional & default
    secure: false, // use https or http
    internal: false, // use internal endpoint
    vpc: false, // use vpc endpoint
    keepAlive: true,
    retries: 3,
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
