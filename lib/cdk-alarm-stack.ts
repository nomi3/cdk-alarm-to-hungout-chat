import * as cdk from '@aws-cdk/core'
import * as sns from '@aws-cdk/aws-sns'
import * as subs from '@aws-cdk/aws-sns-subscriptions'
import * as cw from '@aws-cdk/aws-cloudwatch'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as cw_actions from '@aws-cdk/aws-cloudwatch-actions'

export class CdkAlarmStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const layer = new lambda.LayerVersion(this, 'node-fetch', {
      code: lambda.Code.asset('layer/forChat'),
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_10_X,
        lambda.Runtime.NODEJS_12_X
      ],
      layerVersionName: 'node-fetch'
    })
    const triggerFunction = new lambda.Function(this, 'triggerFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.asset('lambda/trigger-chat-cdk'),
      functionName: 'trigger-chat-cdk'
    })
    const sendChatFunction = new lambda.Function(this, 'sendChatFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.asset('lambda/send-chat-cdk'),
      functionName: 'send-chat-cdk',
      layers: [
        layer
      ]
    })
    sendChatFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'sts:AssumeRole',
        'ssm:GetParameter'
      ],
      resources: [
        '*'
      ]
    }))
    const topic = new sns.Topic(
      this,
      'sendChatTopic',
      {
        displayName: 'send chat',
        topicName: 'sendChatTopicCdk'
      }
    )
    topic.addSubscription(new subs.LambdaSubscription(sendChatFunction))
    const alarm = new cw.Alarm(this, 'sendChatAlarm', {
      evaluationPeriods: 1,
      metric: triggerFunction.metricInvocations(),
      threshold: 2,
      period: cdk.Duration.minutes(1),
      alarmName: 'sendChatCdk'
    })
    alarm.addAlarmAction(new cw_actions.SnsAction(topic));

  }
}
