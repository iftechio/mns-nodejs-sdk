import { client, test } from './init'

test.serial('test topic', async t => {
  const TEST_TOPIC_NAME = 'MNS-TEST-EXAMPLE-TOPIC'
  await client.createTopic({ TopicName: TEST_TOPIC_NAME })

  const queues = await client.listTopic({ Prefix: TEST_TOPIC_NAME })
  t.true(queues.Topic.map(queue => queue.TopicName).includes(TEST_TOPIC_NAME))

  await client.setTopicAttributes({
    TopicName: TEST_TOPIC_NAME,
    Attributes: {
      MaximumMessageSize: 10000,
      LoggingEnabled: true,
    },
  })

  const attributes = await client.getTopicAttributes({ TopicName: TEST_TOPIC_NAME })
  t.is(attributes.MaximumMessageSize, '10000')
  t.is(attributes.LoggingEnabled, 'True')

  await client.deleteTopic({ TopicName: TEST_TOPIC_NAME })
})

test.serial('test subscription', async t => {
  const TEST_TOPIC_NAME = 'MNS-TEST-EXAMPLE-TOPIC'
  await client.createTopic({ TopicName: TEST_TOPIC_NAME })

  const TEST_QUEUE_NAME = 'MNS-TEST-EXAMPLE-QUEUE'
  await client.createQueue({ QueueName: TEST_QUEUE_NAME })

  const TEST_SUBSCRIBE_NAME = 'MNS-TEST-EXAMPLE-TOPIC'
  await client.subscribe({
    TopicName: TEST_TOPIC_NAME,
    SubscriptionName: TEST_SUBSCRIBE_NAME,
    Attributes: {
      Endpoint: `acs:mns:${client.region}:${client.accountId}:queues/${TEST_QUEUE_NAME}`,
      NotifyContentFormat: 'SIMPLIFIED',
    },
  })

  const subscriptions = await client.listSubscriptionByTopic({ TopicName: TEST_TOPIC_NAME })
  t.true(
    subscriptions.Subscription.map(subscription => subscription.SubscriptionName).includes(
      TEST_SUBSCRIBE_NAME,
    ),
  )

  await client.setSubscriptionAttributes({
    TopicName: TEST_TOPIC_NAME,
    SubscriptionName: TEST_SUBSCRIBE_NAME,
    Attributes: {
      NotifyStrategy: 'EXPONENTIAL_DECAY_RETRY',
    },
  })

  const attributes = await client.getSubscriptionAttributes({
    TopicName: TEST_TOPIC_NAME,
    SubscriptionName: TEST_SUBSCRIBE_NAME,
  })
  t.is(attributes.NotifyStrategy, 'EXPONENTIAL_DECAY_RETRY')

  await client.unsubscribe({ TopicName: TEST_TOPIC_NAME, SubscriptionName: TEST_SUBSCRIBE_NAME })
  await client.deleteQueue({ QueueName: TEST_QUEUE_NAME })
  await client.deleteTopic({ TopicName: TEST_TOPIC_NAME })
})

test.serial('test publish', async t => {
  const TEST_TOPIC_NAME = 'MNS-TEST-EXAMPLE-TOPIC'
  await client.createTopic({ TopicName: TEST_TOPIC_NAME })

  const TEST_QUEUE_NAME = 'MNS-TEST-EXAMPLE-QUEUE'
  await client.createQueue({ QueueName: TEST_QUEUE_NAME })

  const TEST_SUBSCRIBE_NAME = 'MNS-TEST-EXAMPLE-SUBSCRIBE'
  await client.subscribe({
    TopicName: TEST_TOPIC_NAME,
    SubscriptionName: TEST_SUBSCRIBE_NAME,
    Attributes: {
      Endpoint: `acs:mns:${client.region}:${client.accountId}:queues/${TEST_QUEUE_NAME}`,
      NotifyContentFormat: 'SIMPLIFIED',
    },
  })

  const TEST_MESSAGE_BODY = 'MNS-TEST-MESSAGE-BODY'
  await client.publishMessage({
    TopicName: TEST_TOPIC_NAME,
    Payloads: { MessageBody: TEST_MESSAGE_BODY },
  })

  const message = await client.receiveMessage({ QueueName: TEST_QUEUE_NAME })
  t.is(message.MessageBody, TEST_MESSAGE_BODY)

  await client.unsubscribe({ TopicName: TEST_TOPIC_NAME, SubscriptionName: TEST_SUBSCRIBE_NAME })
  await client.deleteQueue({ QueueName: TEST_QUEUE_NAME })
  await client.deleteTopic({ TopicName: TEST_TOPIC_NAME })
})
