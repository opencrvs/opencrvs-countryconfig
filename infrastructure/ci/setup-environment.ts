import { Octokit } from '@octokit/core'
import { PromptObject } from 'prompts'
import prompts from 'prompts'
import minimist from 'minimist'

import kleur from 'kleur'
import {
  Variable,
  Secret,
  getRepositoryId,
  listEnvironmentSecrets,
  listEnvironmentVariables,
  createRepositorySecret,
  createEnvironmentSecret,
  createVariable,
  updateVariable,
  createEnvironment,
  listRepositorySecrets
} from './github'

import editor from '@inquirer/editor'
import { writeFileSync } from 'fs'

const notEmpty = (value: string | number) =>
  value.toString().trim().length > 0 ? true : 'Please enter a value'

type Question<T extends string> = PromptObject<T> & {
  name: T
  valueType?: 'SECRET' | 'VARIABLE'
  scope: 'ENVIRONMENT' | 'REPOSITORY'
  valueLabel?: string
}

type QuestionDescriptor<T extends string> = Omit<Question<T>, 'type'> & {
  type: 'disabled' | PromptObject<T>['type']
}

type SecretAnswer = {
  type: 'SECRET'
  scope: 'ENVIRONMENT' | 'REPOSITORY'
  name: string
  value: string
  didExist: Secret | undefined
}

type VariableAnswer = {
  type: 'VARIABLE'
  name: string
  didExist: Variable | undefined
  value: string
}
type Answers = (SecretAnswer | VariableAnswer)[]

function questionToPrompt<T extends string>({
  // eslint-disable-next-line no-unused-vars
  valueType,
  // eslint-disable-next-line no-unused-vars
  valueLabel,
  // eslint-disable-next-line no-unused-vars
  scope,
  ...promptOptions
}: Question<T>): PromptObject<T> {
  return promptOptions
}

// eslint-disable-next-line no-console
const log = console.log

const ALL_QUESTIONS: Array<QuestionDescriptor<any>> = []
const ALL_ANSWERS: Array<Record<string, string>> = []

const { environment } = minimist(process.argv.slice(2))

if (!environment || typeof environment !== 'string') {
  console.error('Please specify an environment name with --environment=<name>')
  process.exit(1)
}

// Read users .env file based on the environment name they gave above, e.g. .env.production
require('dotenv').config({
  path: `${process.cwd()}/.env.${environment}`
})

function findExistingValue<T extends string>(
  name: string,
  type: T,
  scope: 'ENVIRONMENT' | 'REPOSITORY',
  existingValues: Array<Secret | Variable>
) {
  return existingValues.find(
    (value) =>
      value.name === name && value.type === type && value.scope === scope
  ) as
    | (T extends 'SECRET' ? Secret : T extends 'VARIABLE' ? Variable : never)
    | undefined
}

async function promptAndStoreAnswer(
  environment: string,
  questions: Array<Question<any>>,
  existingValues: Array<Secret | Variable>
) {
  log('')
  const processedQuestions = questions.flatMap((question) => {
    const questionWithVariableLabel = {
      ...question,
      message: `${kleur.cyan(question.valueLabel || '')}: ${question.message}`
    }
    if (!questionWithVariableLabel.valueLabel) {
      return questionWithVariableLabel
    }

    if (questionWithVariableLabel.valueType === 'VARIABLE') {
      const existingVariable = findExistingValue(
        questionWithVariableLabel.valueLabel,
        'VARIABLE',
        questionWithVariableLabel.scope,
        existingValues
      )
      if (existingVariable) {
        return [
          {
            name: 'overWrite' + questionWithVariableLabel.name,
            type: 'confirm' as const,
            scope: questionWithVariableLabel.scope,
            message: `${kleur.yellow(
              `Variable ${kleur.cyan(
                existingVariable.name
              )} already exists in Github. Do you want to update it?`
            )}`
          },
          {
            ...questionWithVariableLabel,
            type: ((prev: boolean) =>
              prev ? questionWithVariableLabel.type : null) as any,
            initial: existingVariable.value
          }
        ]
      }
    }

    if (questionWithVariableLabel.valueType === 'SECRET') {
      const existingSecret = findExistingValue(
        questionWithVariableLabel.valueLabel,
        'SECRET',
        questionWithVariableLabel.scope,
        existingValues
      )

      if (existingSecret) {
        return [
          {
            name: 'overWrite' + questionWithVariableLabel.name,
            type: 'confirm' as const,
            scope: questionWithVariableLabel.scope,
            message: `${kleur.yellow(
              `${
                existingSecret.scope === 'REPOSITORY'
                  ? 'Repository secret'
                  : 'Secret'
              } ${kleur.cyan(
                existingSecret.name
              )} already exists in Github. Do you want to update it?`
            )}`
          },
          {
            ...questionWithVariableLabel,
            type: ((prev: boolean) =>
              prev ? questionWithVariableLabel.type : null) as any
          }
        ]
      }
    }
    return questionWithVariableLabel
  })
  const foo = processedQuestions.map(questionToPrompt)
  const result = await prompts(foo, {
    onCancel: () => {
      process.exit(1)
    }
  })
  ALL_ANSWERS.push(result)
  storeSecrets(environment, getAnswers(existingValues))

  const existingValuesForQuestions = questions
    // Only variables can have previous values we can use
    .filter((question) => question.valueType === 'VARIABLE')
    .map((question) => [
      question.name,
      findExistingValue(
        question.valueLabel!,
        'VARIABLE',
        question.scope,
        existingValues
      )?.value
    ])

  return { ...Object.fromEntries(existingValuesForQuestions), ...result }
}

function generateLongPassword() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
  let result = ''
  for (let i = 16; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

function storeSecrets(environment: string, answers: Answers) {
  writeFileSync(
    `.env.${environment}`,
    answers.map((update) => `${update.name}="${update.value}"`).join('\n')
  )
}

const githubQuestions = [
  {
    name: 'githubOrganisation',
    type: 'text' as const,
    message: 'What is the name of your Github organisation?',
    validate: notEmpty,
    initial: process.env.GITHUB_ORGANISATION,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'githubRepository',
    type: 'text' as const,
    message: 'What is your Github repository?',
    validate: notEmpty,
    initial: process.env.GITHUB_REPOSITORY,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'githubToken',
    type: 'text' as const,
    message: 'What is your Github token?',
    validate: notEmpty,
    initial: process.env.GITHUB_TOKEN,
    scope: 'REPOSITORY' as const
  }
]

const dockerhubQuestions = [
  {
    name: 'dockerhubOrganisation',
    type: 'text' as const,
    message: 'What is the name of your Docker Hub organisation?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKERHUB_ACCOUNT',
    validate: notEmpty,
    initial: process.env.DOCKER_ORGANISATION,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'dockerhubRepository',
    type: 'text' as const,
    message: 'What is the name of your private Docker Hub repository?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKERHUB_REPO',
    validate: notEmpty,
    initial: process.env.DOCKER_REPO,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'dockerhubUsername',
    type: 'text' as const,
    message:
      'What is the Docker Hub username the the target server should be using?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKER_USERNAME',
    validate: notEmpty,
    initial: process.env.DOCKER_USERNAME,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'dockerhubToken',
    type: 'text' as const,
    message: 'What is the token of this Docker Hub account?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKER_TOKEN',
    validate: notEmpty,
    initial: process.env.DOCKER_TOKEN,
    scope: 'REPOSITORY' as const
  }
]
const sshQuestions = [
  {
    name: 'sshHost',
    type: 'text' as const,
    message:
      'What is the target server IP address? Note: For "production" environment server clusters of (2, 3 or 5 replicas) this is always the IP address for just 1 manager server',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSH_HOST',
    initial: process.env.SSH_HOST,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'sshUser',
    type: 'text' as const,
    message: 'What is the SSH login user to be used for provisioning?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSH_USER',
    initial: process.env.SSH_USER || 'provision',
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'sshArgs',
    type: 'text' as const,
    message:
      'Specify any additional SSH arguments to be used when connecting to the target machine. For example, if you need to connect via a jump server, you can specify the jump server here.',
    valueType: 'VARIABLE' as const,
    valueLabel: 'SSH_ARGS',
    format: (value: string) => value.trim(),
    initial: process.env.SSH_ARGS,
    scope: 'ENVIRONMENT' as const
  }
]

const sshKeyQuestions = [
  {
    name: 'sshKey',
    type: 'text' as const,
    message: `Paste the SSH private key for SSH_USER here:`,
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSH_KEY',
    initial: process.env.SSH_KEY,
    scope: 'ENVIRONMENT' as const
  }
]

const infrastructureQuestions = [
  {
    name: 'diskSpace',
    type: 'text' as const,
    message: `What is the amount of diskspace that should be dedicated to OpenCRVS data and will become the size of an encrypted cryptfs data directory.
    \n${kleur.red('DO NOT USE ALL DISKSPACE FOR OPENCRVS!')}
    \nLeave at least 50g available for OS use.`,
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'DISK_SPACE',
    initial: process.env.DISK_SPACE || '200g',
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'domain',
    type: 'text' as const,
    message: 'What is the web domain applied after all subdomains in URLs?',
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'DOMAIN',
    initial: process.env.DOMAIN,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'replicas',
    type: 'number' as const,
    message:
      'What is the number of replicas? EDIT: This should be 1 for qa, staging and backup environments.  For "production" environment server clusters of (2, 3 or 5 replicas), set to 2, 3 or 5 as appropriate.',
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'REPLICAS',
    initial: process.env.REPLICAS ? parseInt(process.env.REPLICAS, 10) : 1,
    scope: 'ENVIRONMENT' as const
  }
]

const databaseAndMonitoringQuestions = [
  {
    name: 'kibanaUsername',
    type: 'text' as const,
    message: 'Input the username for logging in to Kibana',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'KIBANA_USERNAME',
    initial: process.env.KIBANA_USERNAME || 'opencrvs-admin',
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'kibanaPassword',
    type: 'text' as const,
    message: 'Input the password for logging in to Kibana',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'KIBANA_PASSWORD',
    initial: process.env.KIBANA_PASSWORD || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'elasticsearchSuperuserPassword',
    type: 'text' as const,
    message: 'Input the password for the Elasticsearch superuser',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
    initial:
      process.env.ELASTICSEARCH_SUPERUSER_PASSWORD || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'minioRootUser',
    type: 'text' as const,
    message: 'Input the username for the Minio root user',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'MINIO_ROOT_USER',
    initial: process.env.MINIO_ROOT_USER || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'minioRootPassword',
    type: 'text' as const,
    message: 'Input the password for the Minio root user',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'MINIO_ROOT_PASSWORD',
    initial: process.env.MINIO_ROOT_PASSWORD || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'mongodbAdminUser',
    type: 'text' as const,
    message: 'Input the username for the MongoDB admin user',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'MONGODB_ADMIN_USER',
    initial: process.env.MONGODB_ADMIN_USER || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'mongodbAdminPassword',
    type: 'text' as const,
    message: 'Input the password for the MongoDB admin user',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'MONGODB_ADMIN_PASSWORD',
    initial: process.env.MONGODB_ADMIN_PASSWORD || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'superUserPassword',
    type: 'text' as const,
    message: 'Input the password for the OpenCRVS super user',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SUPER_USER_PASSWORD',
    initial: process.env.SUPER_USER_PASSWORD || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'encryptionKey',
    type: 'text' as const,
    message: 'Input the password for the disk encryption key',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'ENCRYPTION_KEY',
    initial: process.env.ENCRYPTION_KEY || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  }
]

const notificationTransportQuestions = [
  {
    name: 'notificationTransport',
    type: 'select' as const,
    message: 'Notification transport for 2FA, informant and user messaging',
    choices: [
      {
        title: 'Email (with SMTP details)',
        value: 'email'
      },
      {
        title: 'SMS (Infobip)',
        value: 'sms'
      }
    ],
    valueLabel: 'NOTIFICATION_TRANSPORT',
    valueType: 'VARIABLE' as const,
    scope: 'ENVIRONMENT' as const,
    initial: process.env.NOTIFICATION_TRANSPORT
  }
]

const smsQuestions = [
  {
    name: 'infobipApiKey',
    type: 'text' as const,
    message: 'What is your Infobip API key?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'INFOBIP_API_KEY',
    initial: process.env.INFOBIP_API_KEY,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'infobipGatewayEndpoint',
    type: 'text' as const,
    message: 'What is your Infobip gateway endpoint?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'INFOBIP_GATEWAY_ENDPOINT',
    initial: process.env.INFOBIP_GATEWAY_ENDPOINT,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'infobipSenderId',
    type: 'text' as const,
    message: 'What is your Infobip sender ID?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'INFOBIP_SENDER_ID',
    initial: process.env.INFOBIP_SENDER_ID,
    scope: 'ENVIRONMENT' as const
  }
]

const emailQuestions = [
  {
    name: 'smtpHost',
    type: 'text' as const,
    message: 'What is your SMTP host?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_HOST',
    initial: process.env.SMTP_HOST,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpUsername',
    type: 'text' as const,
    message: 'What is your SMTP username?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_USERNAME',
    initial: process.env.SMTP_USERNAME,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpPassword',
    type: 'text' as const,
    message: 'What is your SMTP password?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_PASSWORD',
    initial: process.env.SMTP_PASSWORD,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpPort',
    type: 'text' as const,
    message: 'What is your SMTP port?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_PORT',
    initial: process.env.SMTP_PORT,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpSecure',
    type: 'select' as const,
    message: 'Is the SMTP connection made securely using TLS?',
    choices: [
      {
        title: 'True',
        value: 'true'
      },
      {
        title: 'False',
        value: 'false'
      }
    ],
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_SECURE',
    initial: process.env.SMTP_SECURE,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'senderEmailAddress',
    type: 'text' as const,
    message: 'What is your sender email address?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SENDER_EMAIL_ADDRESS',
    initial: process.env.SENDER_EMAIL_ADDRESS,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'alertEmail',
    type: 'text' as const,
    message:
      'What is the email address to receive alert emails or a Slack channel email link?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'ALERT_EMAIL',
    initial: process.env.ALERT_EMAIL,
    scope: 'ENVIRONMENT' as const
  }
]

const backupQuestions = [
  {
    name: 'backupHost',
    type: 'text' as const,
    message: 'What is your backup host IP address?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'BACKUP_HOST',
    initial: process.env.BACKUP_HOST,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'backupEncryptionPassprase',
    type: 'text' as const,
    message: 'Input a long random passphrase to be used for encrypting backups',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'BACKUP_ENCRYPTION_PASSPHRASE',
    initial: process.env.BACKUP_ENCRYPTION_PASSPHRASE || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  }
]
const vpnQuestions = [
  {
    name: 'vpnHostAddress',
    type: 'text' as const,
    message: `Please enter the source IP address for users connecting to this environment. This is the public IP address of the VPN server.`,
    initial: process.env.VPN_HOST_ADDRESS || '',
    validate: notEmpty,
    valueType: 'VARIABLE' as const,
    valueLabel: 'VPN_HOST_ADDRESS',
    scope: 'ENVIRONMENT' as const
  }
]
const vpnHostQuestions = [
  {
    name: 'vpnAdminPassword',
    type: 'text' as const,
    message: `Admin password for Wireguard UI`,
    initial: generateLongPassword(),
    valueType: 'SECRET' as const,
    valueLabel: 'VPN_ADMIN_PASSWORD',
    scope: 'ENVIRONMENT' as const
  }
]

const sentryQuestions = [
  {
    name: 'sentryDsn',
    type: 'text' as const,
    message: 'What is your Sentry DSN?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SENTRY_DSN',
    initial: process.env.SENTRY_DSN,
    scope: 'ENVIRONMENT' as const
  }
]

const derivedVariables = [
  {
    valueType: 'VARIABLE',
    name: 'ACTIVATE_USERS',
    type: 'disabled',
    valueLabel: 'ACTIVATE_USERS',
    scope: 'ENVIRONMENT'
  },
  {
    valueType: 'VARIABLE',
    name: 'AUTH_HOST',
    type: 'disabled',
    valueLabel: 'AUTH_HOST',
    scope: 'ENVIRONMENT'
  },
  {
    valueType: 'VARIABLE',
    name: 'COUNTRY_CONFIG_HOST',
    type: 'disabled',
    valueLabel: 'COUNTRY_CONFIG_HOST',
    scope: 'ENVIRONMENT'
  },
  {
    valueType: 'VARIABLE',
    name: 'GATEWAY_HOST',
    type: 'disabled',
    valueLabel: 'GATEWAY_HOST',
    scope: 'ENVIRONMENT'
  },
  {
    valueType: 'VARIABLE',
    name: 'CONTENT_SECURITY_POLICY_WILDCARD',
    type: 'disabled',
    valueLabel: 'CONTENT_SECURITY_POLICY_WILDCARD',
    scope: 'ENVIRONMENT'
  },
  {
    valueType: 'VARIABLE',
    name: 'CLIENT_APP_URL',
    type: 'disabled',
    valueLabel: 'CLIENT_APP_URL',
    scope: 'ENVIRONMENT'
  },
  {
    valueType: 'VARIABLE',
    name: 'LOGIN_URL',
    type: 'disabled',
    valueLabel: 'LOGIN_URL',
    scope: 'ENVIRONMENT'
  }
] as const

ALL_QUESTIONS.push(
  ...dockerhubQuestions,
  ...sshQuestions,
  ...sshKeyQuestions,
  ...infrastructureQuestions,
  ...databaseAndMonitoringQuestions,
  ...notificationTransportQuestions,
  ...smsQuestions,
  ...emailQuestions,
  ...backupQuestions,
  ...vpnQuestions,
  ...vpnHostQuestions,
  ...sentryQuestions,
  ...derivedVariables
)
;(async () => {
  const { type } = await prompts(
    [
      {
        name: 'type',
        type: 'select' as const,
        scope: 'ENVIRONMENT' as const,
        message: 'Purpose for the environment?',
        choices: [
          {
            title: 'Production (hosts PII data, requires frequent backups)',
            value: 'production'
          },
          {
            title: 'Staging (hosts PII data, no backups)',
            value: 'production'
          },
          { title: 'Quality assurance (no PII data)', value: 'qa' },
          { title: 'Other', value: 'development' }
        ]
      }
    ].map(questionToPrompt)
  )

  log('\n', kleur.bold().underline('Github'))

  const { githubOrganisation, githubRepository, githubToken } = await prompts(
    githubQuestions.map(questionToPrompt),
    {
      onCancel: () => {
        process.exit(1)
      }
    }
  )

  const octokit = new Octokit({
    auth: githubToken
  })

  await createEnvironment(
    octokit,
    environment,
    githubOrganisation,
    githubRepository
  )

  const repositoryId = await getRepositoryId(
    octokit,
    githubOrganisation,
    githubRepository
  )

  const existingRepositoryVariable = await listRepositorySecrets(
    octokit,
    githubOrganisation,
    githubRepository
  )
  const existingEnvironmentVariables = await listEnvironmentVariables(
    octokit,
    repositoryId,
    environment
  )

  const existingEnvironmentSecrets = await listEnvironmentSecrets(
    octokit,
    githubOrganisation,
    repositoryId,
    environment
  )

  const existingValues = [
    ...existingEnvironmentVariables,
    ...existingRepositoryVariable,
    ...existingEnvironmentSecrets
  ]

  if (
    existingEnvironmentVariables.length > 0 ||
    existingEnvironmentSecrets.length > 0
  ) {
    log(
      '\nEnvironment with the name',
      environment,
      'already exists in Github.\n',
      'Found',
      existingEnvironmentVariables.length,
      'existing variables and',
      existingEnvironmentSecrets.length,
      'secrets'
    )
  } else {
    log(kleur.green('\nSuccessfully logged in to Github\n'))
  }

  log('\n', kleur.bold().underline('Docker Hub'))

  await promptAndStoreAnswer(environment, dockerhubQuestions, existingValues)

  log('\n', kleur.bold().underline('SSH'))
  await promptAndStoreAnswer(environment, sshQuestions, existingValues)

  const SSH_KEY_EXISTS = existingValues.find(
    (value) => value.name === 'SSH_KEY' && value.scope === 'ENVIRONMENT'
  )

  if (!SSH_KEY_EXISTS) {
    const sshKey = await editor({
      message: `Paste the SSH private key for ${kleur.cyan('SSH_USER')} here:`
    })

    const formattedSSHKey = sshKey.endsWith('\n') ? sshKey : sshKey + '\n'
    ALL_ANSWERS.push({ sshKey: formattedSSHKey })
  }

  log('\n', kleur.bold().underline('Server setup'))
  await promptAndStoreAnswer(
    environment,
    infrastructureQuestions,
    existingValues
  )

  log('\n', kleur.bold().underline('Databases & monitoring'))

  await promptAndStoreAnswer(
    environment,
    databaseAndMonitoringQuestions,
    existingValues
  )
  log('\n', kleur.bold().underline('Sentry'))
  const sentryDSNExists = findExistingValue(
    'SENTRY_DSN',
    'SECRET',
    'ENVIRONMENT',
    existingValues
  )

  if (sentryDSNExists) {
    await promptAndStoreAnswer(environment, sentryQuestions, existingValues)
  } else {
    const { useSentry } = await prompts(
      [
        {
          name: 'useSentry',
          type: 'confirm' as const,
          message: 'Do you want to use Sentry?',
          scope: 'ENVIRONMENT' as const,
          initial: Boolean(process.env.SENTRY_DNS)
        }
      ].map(questionToPrompt)
    )

    if (useSentry) {
      await promptAndStoreAnswer(environment, sentryQuestions, existingValues)
    }
  }

  if (['production', 'staging'].includes(type)) {
    log('\n', kleur.bold().underline('Backups'))
    await promptAndStoreAnswer(environment, backupQuestions, existingValues)

    log('\n', kleur.bold().underline('VPN'))

    await promptAndStoreAnswer(environment, vpnQuestions, existingValues)
  }

  const vpnAdminPasswordExists = findExistingValue(
    'VPN_ADMIN_PASSWORD',
    'SECRET',
    'ENVIRONMENT',
    existingValues
  )

  if (vpnAdminPasswordExists) {
    await promptAndStoreAnswer(environment, vpnHostQuestions, existingValues)
  } else {
    const { isVPNHost } = await prompts(
      [
        {
          name: 'isVPNHost',
          type: 'confirm' as const,
          message: `Is this environment going to be used as the VPN server (Wireguard)?`,
          scope: 'ENVIRONMENT' as const,
          initial: true
        }
      ].map(questionToPrompt)
    )

    if (isVPNHost) {
      await promptAndStoreAnswer(environment, vpnHostQuestions, existingValues)
    }
  }

  log('\n', kleur.bold().underline('SMTP'))
  await promptAndStoreAnswer(environment, emailQuestions, existingValues)

  log('\n', kleur.bold().underline('Notification'))

  const { notificationTransport } = await promptAndStoreAnswer(
    environment,
    notificationTransportQuestions,
    existingValues
  )

  if (notificationTransport.includes('sms')) {
    await promptAndStoreAnswer(environment, smsQuestions, existingValues)
  }

  const allAnswers = ALL_ANSWERS.reduce((acc, answer) => {
    return { ...acc, ...answer }
  })

  /*
   * Variables the user doesn't need to set manually
   */
  const answerOrExisting = (
    variable: string | undefined,
    existingValue: Variable | undefined,
    fn: (value: string | undefined) => string
  ) => fn(variable || existingValue?.value) || ''

  const derivedUpdates = [
    {
      type: 'VARIABLE' as const,
      name: 'ACTIVATE_USERS',
      value: ['production', 'staging'].includes(environment) ? 'false' : 'true',
      didExist: findExistingValue(
        'ACTIVATE_USERS',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      type: 'VARIABLE' as const,
      name: 'AUTH_HOST',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
        (val) => `https://auth.${val}`
      ),
      didExist: findExistingValue(
        'AUTH_HOST',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      type: 'VARIABLE' as const,
      name: 'COUNTRY_CONFIG_HOST',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
        (val) => `https://countryconfig.${val}`
      ),
      didExist: findExistingValue(
        'COUNTRY_CONFIG_HOST',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      type: 'VARIABLE' as const,
      name: 'GATEWAY_HOST',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
        (val) => `https://gateway.${val}`
      ),
      didExist: findExistingValue(
        'GATEWAY_HOST',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      type: 'VARIABLE' as const,
      name: 'CONTENT_SECURITY_POLICY_WILDCARD',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
        (val) => `*.${val}`
      ),
      didExist: findExistingValue(
        'CONTENT_SECURITY_POLICY_WILDCARD',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      type: 'VARIABLE' as const,
      name: 'CLIENT_APP_URL',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
        (val) => `https://register.${val}`
      ),
      didExist: findExistingValue(
        'CLIENT_APP_URL',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      type: 'VARIABLE' as const,
      name: 'LOGIN_URL',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
        (val) => `https://login.${val}`
      ),
      didExist: findExistingValue(
        'LOGIN_URL',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      ),
      scope: 'ENVIRONMENT' as const
    }
  ]

  const updates: Answers = getAnswers(existingValues)
    .concat(...derivedUpdates)
    .filter(
      (variable) =>
        Boolean(variable.value) &&
        // Only update values that changed
        (variable.type !== 'VARIABLE' ||
          variable.value !== variable.didExist?.value)
    )

  /*
   * List out all updates to the variables and confirm with the user
   */

  const newSecrets = updates.filter(
    (update): update is SecretAnswer =>
      update.type === 'SECRET' && !update.didExist
  )
  const updatedSecrets = updates.filter(
    (update): update is SecretAnswer =>
      update.type === 'SECRET' && Boolean(update.didExist)
  )
  const newVariables = updates.filter(
    (update): update is VariableAnswer =>
      update.type === 'VARIABLE' && !update.didExist
  )
  const updatedVariables = updates.filter(
    (update): update is VariableAnswer =>
      update.type === 'VARIABLE' && Boolean(update.didExist)
  )

  const unknownVariables = existingValues.filter((value) => {
    return !ALL_QUESTIONS.find(
      (question) =>
        question.valueLabel === value.name &&
        question.valueType === value.type &&
        question.scope === value.scope
    )
  })

  log('')

  if (newSecrets.length > 0) {
    log(
      kleur.yellow(
        `The following secrets will be added to Github for environment ${environment}:`
      )
    )
    newSecrets.forEach((secret) => {
      log(secret.name, '=', secret.value)
    })
    log('')
  }
  if (updatedSecrets.length > 0) {
    log(
      kleur.yellow(
        `The following secrets will be updated in Github for environment ${environment}:`
      )
    )
    updatedSecrets.forEach((secret) => {
      log(secret.name, '=', secret.value)
    })
    log('')
  }
  if (newVariables.length > 0) {
    log(
      kleur.yellow(
        `The following variables will be added to Github for environment ${environment}:`
      )
    )
    newVariables.forEach((variable) => {
      log(variable.name, '=', variable.value)
    })
    log('')
  }
  if (updatedVariables.length > 0) {
    log(
      kleur.yellow(
        `The following variables will be updated in Github for environment ${environment}:`
      )
    )

    updatedVariables.forEach((variable) => {
      log(
        variable.name,
        '=',
        variable.value,
        `(was ${variable.didExist?.value})`
      )
    })
    log('')
  }

  if (unknownVariables.length > 0) {
    log(
      kleur.yellow(
        `The following unknown variables/secrets were stored in Github are not managed by this script:`
      )
    )
    log('')
    log(kleur.blue(`Repository:`))

    unknownVariables
      .filter(({ scope }) => scope === 'REPOSITORY')
      .forEach((variable) => {
        log(kleur.cyan(variable.type) + ':', variable.name)
      })

    log('')
    log(kleur.blue(`Environment:`))

    unknownVariables
      .filter(({ scope }) => scope === 'ENVIRONMENT')
      .forEach((variable) => {
        log(kleur.cyan(variable.type) + ':', variable.name)
      })

    log('')
    log(
      kleur.yellow(
        `These variables will not be updated by this script. If you want to update them, you will need to do so manually.`
      )
    )
    log('')
  }

  if (
    ([] as Array<any>)
      .concat(newSecrets)
      .concat(updatedSecrets)
      .concat(newVariables)
      .concat(updatedVariables).length === 0
  ) {
    process.exit(0)
  }

  const { confirm } = await prompts([
    {
      name: 'confirm',
      type: 'confirm' as const,
      message: 'Do you want to continue?',
      initial: true
    }
  ])

  if (!confirm) {
    process.exit(0)
  }

  for (const newSecret of newSecrets) {
    log(`Creating secret ${newSecret.name} with value ${newSecret.value}`)
    if (newSecret.scope === 'ENVIRONMENT') {
      await createEnvironmentSecret(
        octokit,
        repositoryId,
        environment,
        newSecret.name,
        newSecret.value,
        githubOrganisation,
        githubRepository
      )
    } else {
      await createRepositorySecret(
        octokit,
        repositoryId,
        newSecret.name,
        newSecret.value,
        githubOrganisation,
        githubRepository
      )
    }
  }
  for (const updatedSecret of updatedSecrets) {
    log(
      `Updating secret ${updatedSecret.name} with value ${updatedSecret.value}`
    )
    if (updatedSecret.scope === 'ENVIRONMENT') {
      await createEnvironmentSecret(
        octokit,
        repositoryId,
        environment,
        updatedSecret.name,
        updatedSecret.value,
        githubOrganisation,
        githubRepository
      )
    } else {
      await createRepositorySecret(
        octokit,
        repositoryId,
        updatedSecret.name,
        updatedSecret.value,
        githubOrganisation,
        githubRepository
      )
    }
  }

  for (const newVariable of newVariables) {
    log(`Creating variable ${newVariable.name} with value ${newVariable.value}`)

    await createVariable(
      octokit,
      repositoryId,
      environment,
      newVariable.name,
      newVariable.value
    )
  }

  for (const updatedVariable of updatedVariables) {
    log(
      `Updating variable ${updatedVariable.name} with value ${updatedVariable.value}`
    )

    await updateVariable(
      octokit,
      repositoryId,
      environment,
      updatedVariable.name,
      updatedVariable.value
    )
  }

  log(
    kleur.green(
      `Successfully updated Github secrets and variables for environment ${environment}`
    )
  )
  log('\nAll variables stored in', kleur.cyan(`.env.${environment}`))
  log(kleur.bold().yellow('DO NOT COMMIT THIS FILE TO GIT!'))
})()

function getAnswers(existingValues: (Secret | Variable)[]): Answers {
  return ALL_ANSWERS.flatMap((answerObject) => {
    const questionsThatAreSecretsOrVariables = Object.entries(
      answerObject
    ).filter(([key, value]) => {
      if (value === '') {
        return false
      }
      const existingQuestion = ALL_QUESTIONS.find(
        (question) => question.name === key
      )
      const valueType = existingQuestion?.valueType
      return valueType === 'VARIABLE' || valueType === 'SECRET'
    })

    return questionsThatAreSecretsOrVariables.map(([key, value]) => {
      const existingQuestion = ALL_QUESTIONS.find(
        (question) => question.name === key
      )
      const valueType = existingQuestion!.valueType!

      if (valueType === 'SECRET') {
        const existingSecret = findExistingValue(
          existingQuestion!.valueLabel!,
          'SECRET',
          existingQuestion?.scope!,
          existingValues
        )
        return {
          type: valueType,
          name: existingQuestion?.valueLabel!,
          value: value.toString(),
          didExist: existingSecret,
          scope: existingQuestion!.scope!
        }
      }
      const existingVariable = findExistingValue(
        existingQuestion?.valueLabel!,
        valueType,
        existingQuestion?.scope!,
        existingValues
      )
      return {
        type: valueType,
        name: existingQuestion?.valueLabel!,
        didExist: findExistingValue(
          existingQuestion?.valueLabel!,
          valueType,
          existingQuestion?.scope!,
          existingValues
        ),
        value: value.toString() || existingVariable?.value || '',
        scope: existingQuestion!.scope!
      }
    })
  })
}
