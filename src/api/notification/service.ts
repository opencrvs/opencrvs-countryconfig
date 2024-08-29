import {
  // SMS_PROVIDER,
  AWS_SNS_REGION_NAME,
  AWS_SNS_ACCESS_KEY_ID,
  AWS_SNS_SECRET_ACCESS_KEY,
  AWS_SNS_SENDER_ID
} from './constant'
import { logger } from '@countryconfig/logger'
import {
  SNSClient,
  PublishCommand,
  PublishCommandOutput
} from '@aws-sdk/client-sns'

async function sendSMSAwsSns(to: string, text: string) {
  const awsSnsClient = new SNSClient({
    region: AWS_SNS_REGION_NAME,
    credentials: {
      accessKeyId: AWS_SNS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SNS_SECRET_ACCESS_KEY
    }
  })

  const publishParams = {
    PhoneNumber: to,
    Message: text,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: AWS_SNS_SENDER_ID
      },
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional'
      }
    }
  }

  const publishSms = new PublishCommand(publishParams)

  let responseData: PublishCommandOutput
  try {
    responseData = await awsSnsClient.send(publishSms)
  } catch (error) {
    logger.error(error)
    throw error
  }

  logger.info(`Response from AWS:SNS: ${JSON.stringify(responseData)}`)
  if (responseData.$metadata.httpStatusCode === 200) {
    logger.error(`Failed to send sms to ${to}`)
    throw new Error(`Failed to send sms to ${to}`)
  }
}

export async function sendSMS(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  return sendSMSAwsSns(msisdn, message)
}
