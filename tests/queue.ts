import { client, test } from './init'

test.serial('test queue', async t => {
  const TEST_QUEUE_NAME = 'MNS-TEST-EXAMPLE-QUEUE'
  await client.createQueue({ QueueName: TEST_QUEUE_NAME })

  const queues = await client.listQueue({ Prefix: TEST_QUEUE_NAME })
  t.true(queues.Queue.map(queue => queue.QueueName).includes(TEST_QUEUE_NAME))

  await client.setQueueAttributes({
    QueueName: TEST_QUEUE_NAME,
    Attributes: {
      DelaySeconds: 20,
      MaximumMessageSize: 10000,
      MessageRetentionPeriod: 120,
      PollingWaitSeconds: 20,
      LoggingEnabled: true,
      VisibilityTimeout: 20
    }
  })

  const attributes = await client.getQueueAttributes({ QueueName: TEST_QUEUE_NAME })
  t.is(attributes.DelaySeconds, '20')
  t.is(attributes.MaximumMessageSize, '10000')
  t.is(attributes.MessageRetentionPeriod, '120')
  t.is(attributes.PollingWaitSeconds, '20')
  t.is(attributes.LoggingEnabled, 'True')
  t.is(attributes.VisibilityTimeout, '20')

  await client.deleteQueue({ QueueName: TEST_QUEUE_NAME })
})

test.serial('test message', async t => {
  const TEST_QUEUE_NAME = 'MNS-TEST-EXAMPLE-QUEUE'
  await client.createQueue({ QueueName: TEST_QUEUE_NAME })

  const TEST_MESSAGE_BODY = 'MNS-TEST-MESSAGE-BODY'
  await client.sendMessage({
    QueueName: TEST_QUEUE_NAME,
    Payloads: {
      MessageBody: TEST_MESSAGE_BODY
    }
  })

  const peekMessage = await client.peekMessage({ QueueName: TEST_QUEUE_NAME })
  t.is(peekMessage.MessageBody, TEST_MESSAGE_BODY)


  const receiveMessage = await client.receiveMessage({ QueueName: TEST_QUEUE_NAME })
  t.is(receiveMessage.MessageBody, TEST_MESSAGE_BODY)

  await client.changeMessageVisibility({ QueueName: TEST_QUEUE_NAME, ReceiptHandle: receiveMessage.ReceiptHandle, VisibilityTimeout: 300 })

  await client.deleteMessage({ QueueName: TEST_QUEUE_NAME, ReceiptHandle: receiveMessage.ReceiptHandle })
  await client.deleteQueue({ QueueName: TEST_QUEUE_NAME })
})

test.serial('test batch message', async t => {
  const TEST_QUEUE_NAME = 'MNS-TEST-EXAMPLE-QUEUE'
  await client.createQueue({ QueueName: TEST_QUEUE_NAME })

  const TEST_MESSAGE_BODIES = ['MNS-TEST-MESSAGE-BODY-1', 'MNS-TEST-MESSAGE-BODY-2', 'MNS-TEST-MESSAGE-BODY-3']
  await client.batchSendMessage({
    QueueName: TEST_QUEUE_NAME,
    Entries: TEST_MESSAGE_BODIES.map(message => ({ MessageBody: message }))
  })

  const peekMessages = await client.batchPeekMessage({ QueueName: TEST_QUEUE_NAME, NumOfMessages: 3 })
  t.assert(peekMessages)

  const receiveMessages = await client.batchReceiveMessage({ QueueName: TEST_QUEUE_NAME, NumOfMessages: 3 })
  t.assert(receiveMessages)

  await client.batchDeleteMessage({ QueueName: TEST_QUEUE_NAME, ReceiptHandles: receiveMessages.map(message => message.ReceiptHandle) })

  await client.deleteQueue({ QueueName: TEST_QUEUE_NAME })
})


