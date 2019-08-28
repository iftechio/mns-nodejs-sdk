export type CreateQueueResponse = {
  Location: string
}

export type ListQueueResponse = {
  Queue: GetQueueAttributesResponse &
    {
      QueueURL: string
    }[]
  NextMarker?: string
}

export type GetQueueAttributesResponse = {
  QueueName: string
  CreateTime: string
  LastModifyTime: string
  DelaySeconds: string
  MaximumMessageSize: string
  MessageRetentionPeriod: string
  PollingWaitSeconds: string
  ActiveMessages: string
  InactiveMessages: string
  DelayMessages: string
  LoggingEnabled: string
  VisibilityTimeout: string
}

export type SendMessageResponse = {
  MessageId: string
  MessageBodyMD5: string
  ReceiptHandle?: string
}

export type ReceiveMessageResponse = PeekMessageResponse & ChangeMessageVisibilityResponse

export type PeekMessageResponse = {
  MessageId: string
  MessageBodyMD5: string
  MessageBody: string
  EnqueueTime: string
  FirstDequeueTime: string
  DequeueCount: string
  Priority: string
}

export type DeleteMessageResponse = {
  ErrorCode: string
  ErrorMessage: string
  ReceiptHandle: string
}

export type ChangeMessageVisibilityResponse = {
  ReceiptHandle: string
  NextVisibleTime: string
}

export type CreateTopicResponse = {
  Location: string
}

export type ListTopicResponse = {
  Topic: GetTopicAttributesResponse & { TopicURL: string }[]
  NextMarker?: string
}

export type GetTopicAttributesResponse = {
  TopicName: string
  MessageCount: string
  MaximumMessageSize: string
  MessageRetentionPeriod: string
  CreateTime: string
  LastModifyTime: string
  LoggingEnabled: string
}

export type SubscribeResponse = {
  Location: string
}

export type ListSubscriptionResponse = {
  Subscription: GetSubscriptionAttributesResponse[]
  NextMarker?: string
}

export type GetSubscriptionAttributesResponse = {
  SubscriptionName: string
  Subscriber: string
  TopicName: string
  TopicOwner: string
  CreateTime: string
  LastModifyTime: string
  Endpoint: string
  NotifyStrategy: string
  NotifyContentFormat: string
  SubscriptionURL: string
}

export type PublishMessageResponse = {
  MessageId: string
  MessageBodyMD5: string
}
