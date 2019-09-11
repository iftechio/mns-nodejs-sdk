// Request
export type CreateQueueRequest = {
  QueueName: string
  Attributes?: {
    DelaySeconds?: number
    MaximumMessageSize?: number
    MessageRetentionPeriod?: number
    VisibilityTimeout?: number
    PollingWaitSeconds?: number
    LoggingEnabled?: boolean
  }
}

export type DeleteQueueRequest = {
  QueueName: string
}

export type ListQueueRequest = {
  Start?: string
  Limit?: number
  Prefix?: string
}

export type GetQueueAttributesRequest = DeleteQueueRequest

export type SetQueueAttributesRequest = CreateQueueRequest

export type SendMessageRequest = {
  QueueName: string
  Payloads: {
    MessageBody: string
    DelaySeconds?: number
    Priority?: number
  }
}

export type BatchSendMessageRequest = {
  QueueName: string
  Entries: {
    MessageBody: string
    DelaySeconds?: number
    Priority?: number
  }[]
}

export type ReceiveMessageRequest = PeekMessageRequest & {
  WaitSeconds?: number
}

export type BatchReceiveMessageRequest = BatchPeekMessageRequest & {
  WaitSeconds?: number
}

export type PeekMessageRequest = {
  QueueName: string
}

export type BatchPeekMessageRequest = {
  QueueName: string
  NumOfMessages: number
}

export type DeleteMessageRequest = {
  QueueName: string
  ReceiptHandle: string
}

export type BatchDeleteMessageRequest = {
  QueueName: string
  ReceiptHandles: string[]
}

export type ChangeMessageVisibilityRequest = DeleteMessageRequest & {
  VisibilityTimeout: number
}

export type CreateTopicRequest = {
  TopicName: string
  Attributes?: {
    MaximumMessageSize?: number
    LoggingEnabled?: boolean
  }
}

export type DeleteTopicRequest = {
  TopicName: string
}

export type ListTopicRequest = ListQueueRequest

export type GetTopicAttributesRequest = DeleteTopicRequest

export type SetTopicAttributesRequest = CreateTopicRequest

export type SubscribeRequest = UnsubscribeRequest & {
  Attributes: {
    Endpoint: string
    FilterTag?: string
    NotifyStrategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY'
    NotifyContentFormat?: 'XML' | 'JSON' | 'SIMPLIFIED'
  }
}

export type UnsubscribeRequest = {
  TopicName: string
  SubscriptionName: string
}

export type ListSubscriptionByTopicRequest = ListQueueRequest & {
  TopicName: string
}

export type GetSubscriptionAttributesRequest = UnsubscribeRequest

export type SetSubscriptionAttributesRequest = UnsubscribeRequest & {
  Attributes?: {
    NotifyStrategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY'
  }
}

export type PublishMessageRequest = {
  TopicName: string
  Payloads: {
    MessageBody: string
    MessageTag?: string
    MessageAttributes?: any
  }
}

// Response
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
