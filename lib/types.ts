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

export type ReceiveMessageRequest = {
  QueueName: string
  WaitSeconds?: number
}

/**
 * NumOfMessages means the max number of receiving messages, not exactly the number of receiving messages.
 */
export type BatchReceiveMessageRequest = {
  QueueName: string
  NumOfMessages: number
  WaitSeconds?: number
}

export type PeekMessageRequest = {
  QueueName: string
}

/**
 * NumOfMessages means the max number of peeking messages, not exactly the number of peeking messages.
 */
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

export type ChangeMessageVisibilityRequest = {
  QueueName: string
  ReceiptHandle: string
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

export type SubscribeRequest = {
  TopicName: string
  SubscriptionName: string
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

export type ListSubscriptionByTopicRequest = {
  TopicName: string
  Start?: string
  Limit?: number
  Prefix?: string
}

export type GetSubscriptionAttributesRequest = UnsubscribeRequest

export type SetSubscriptionAttributesRequest = {
  TopicName: string
  SubscriptionName: string
  Attributes?: {
    NotifyStrategy?: 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY'
  }
}

export type PublishMessageRequest = {
  TopicName: string
  Payloads: {
    MessageBody: string
    MessageTag?: string
    MessageAttributes?: {
      DirectMail?: {
        AccountName: string
        Subject: string
        AddressType: 0 | 1
        IsHtml: 0 | 1
        ReplyToAddress: 0 | 1
      }
      DirectSMS?: {
        FreeSignName: string
        TemplateCode: string
        Type: 'singleContent' | 'multiContent'
        Receiver: string
        SmsParams: string
      }
    }
  }
}

// Response
export type CreateQueueResponse = {
  Location: string
}

export type ListQueueResponse = {
  Queue: {
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

export type ReceiveMessageResponse = {
  MessageId: string
  MessageBodyMD5: string
  MessageBody: string
  EnqueueTime: string
  FirstDequeueTime: string
  DequeueCount: string
  Priority: string
  ReceiptHandle: string
  NextVisibleTime: string
}

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
  Topic: {
    TopicName: string
    MessageCount: string
    MaximumMessageSize: string
    MessageRetentionPeriod: string
    CreateTime: string
    LastModifyTime: string
    LoggingEnabled: string
    TopicURL: string
  }[]
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
