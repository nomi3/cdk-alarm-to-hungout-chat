const fetch = require('node-fetch')
const AWS = require('aws-sdk')

exports.handler = async (event, context, callback) => {
  const ssm = new AWS.SSM()
  const res = await ssm.getParameter({ Name: 'HANGOUTS_CHAT_WEBHOOK_URL', WithDecryption: true }).promise()

  const fromSNS = event.Records[0].Sns.Message
  const data = JSON.stringify({
    text: `${fromSNS}`
  })

  fetch(res.Parameter.Value, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: data
  })

  callback(null, event)
}