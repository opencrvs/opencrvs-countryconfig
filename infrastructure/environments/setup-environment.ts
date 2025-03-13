import { Octokit } from '@octokit/core'
import { spawn } from 'child_process'
import dotenv from 'dotenv'
import kleur from 'kleur'
import prompts, { PromptObject } from 'prompts'
import {
  Secret,
  Variable,
  createEnvironment,
  createEnvironmentSecret,
  createRepositorySecret,
  createVariable,
  getRepositoryId,
  listEnvironmentSecrets,
  listEnvironmentVariables,
  listRepositorySecrets,
  updateVariable
} from './github'

import editor from '@inquirer/editor'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { error, info, log, success, warn } from './logger'
import { verifyConnection } from './ssh'

const notEmpty = (value: string | number) =>
  value.toString().trim().length > 0 ? true : 'Please enter a value'

function runInteractiveShell(
  command: string,
  args: string[] = []
): Promise<string> {
  return new Promise((resolve, reject) => {
    const shell = spawn(command, args, { stdio: 'inherit' })

    shell.on('close', (code) => {
      if (code === 0) {
        resolve(`Shell exited with code ${code}`)
      } else {
        reject(new Error(`Shell exited with code ${code}`))
      }
    })

    shell.on('error', (err) => {
      reject(err)
    })
  })
}

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
  scope: 'ENVIRONMENT' | 'REPOSITORY'
}

type Answer = SecretAnswer | VariableAnswer
type Answers = Answer[]
type AnswerWithNullValue =
  | (Omit<SecretAnswer, 'value'> & {
      value: SecretAnswer['value'] | null
    })
  | (Omit<VariableAnswer, 'value'> & {
      value: VariableAnswer['value'] | null
    })

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

const ALL_QUESTIONS: Array<QuestionDescriptor<any>> = []
const ALL_ANSWERS: Array<Record<string, string>> = []

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
  questions: Array<QuestionDescriptor<any>>,
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

  const promptQuestions = processedQuestions.map(questionToPrompt)

  const result = await prompts(promptQuestions, {
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
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 16; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

function storeSecrets(environment: string, answers: Answers) {
  let envConfig: Record<string, string> = {}
  try {
    envConfig = dotenv.parse(
      readFileSync(`${process.cwd()}/.env.${environment}`)
    )
  } catch (error) {
    envConfig = {}
  }

  const linesFromAnswers = answers.map(
    (update) => `${update.name}="${update.value}"`
  )
  const linesFromEnvConfig = Object.entries(envConfig)
    .filter(([name]) => !answers.find((update) => update.name === name))
    .map(([name, value]) => `${name}="${value}"`)

  const allLines = [...linesFromEnvConfig, ...linesFromAnswers].sort()

  writeFileSync(`.env.${environment}`, allLines.join('\n'))
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
  }
]
const githubTokenQuestion = [
  {
    name: 'githubToken',
    type: 'text' as const,
    message: 'What is your Github token?',
    validate: notEmpty,
    initial: process.env.GITHUB_TOKEN,
    valueType: 'SECRET' as const,
    scope: 'REPOSITORY' as const,
    valueLabel: 'GH_TOKEN'
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
      'What is the target server IP address? (Note: For "production" environment with 2, 3 or 5 servers, this is the IP address of the manager server)',
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'SSH_HOST',
    initial: process.env.SSH_HOST,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'sshPort',
    type: 'number' as const,
    message:
      'What port number is used in establishing the SSH connection? This usually is the default 22. If you are an advanced user, and have set a different port, provide it here.',
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'SSH_PORT',
    initial: process.env.SSH_PORT ? parseInt(process.env.SSH_PORT) : 22,
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
    message: `Paste the SSH private key for SSH_USER (provision) here:`,
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSH_KEY',
    initial: process.env.SSH_KEY,
    scope: 'ENVIRONMENT' as const
  }
]

const countryQuestions = [
  {
    name: 'country',
    type: 'text' as const,
    message:
      'What is the ISO 3166-1 alpha-3 country-code? (e.g. "NZL" for New Zealand) Reference: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3',
    valueType: 'VARIABLE' as const,
    valueLabel: 'COUNTRY',
    initial: process.env.COUNTRY,
    scope: 'REPOSITORY' as const
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
      'What is the number of servers? Note: This should be 1 for qa, staging and backup environments. For "production" environment server cluster should consists of 2, 3 or 5 servers.',
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
    name: 'ACTIVATE_USERS',
    valueLabel: 'ACTIVATE_USERS',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'AUTH_HOST',
    valueLabel: 'AUTH_HOST',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'COUNTRY_CONFIG_HOST',
    valueLabel: 'COUNTRY_CONFIG_HOST',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'GATEWAY_HOST',
    valueLabel: 'GATEWAY_HOST',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'CONTENT_SECURITY_POLICY_WILDCARD',
    valueLabel: 'CONTENT_SECURITY_POLICY_WILDCARD',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'CLIENT_APP_URL',
    valueLabel: 'CLIENT_APP_URL',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'LOGIN_URL',
    valueLabel: 'LOGIN_URL',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
    valueLabel: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'KIBANA_SYSTEM_PASSWORD',
    valueLabel: 'KIBANA_SYSTEM_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MINIO_ROOT_USER',
    valueLabel: 'MINIO_ROOT_USER',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MINIO_ROOT_PASSWORD',
    valueLabel: 'MINIO_ROOT_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MONGODB_ADMIN_USER',
    valueLabel: 'MONGODB_ADMIN_USER',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MONGODB_ADMIN_PASSWORD',
    valueLabel: 'MONGODB_ADMIN_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'SUPER_USER_PASSWORD',
    valueLabel: 'SUPER_USER_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'ENCRYPTION_KEY',
    valueLabel: 'ENCRYPTION_KEY',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'GH_ENCRYPTION_PASSWORD',
    valueLabel: 'GH_ENCRYPTION_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'REPOSITORY'
  },
  {
    name: 'SSH_USER',
    valueLabel: 'SSH_USER',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT',
    value: 'provision'
  },
  {
    name: 'BACKUP_ENCRYPTION_PASSPHRASE',
    valueLabel: 'BACKUP_ENCRYPTION_PASSPHRASE',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  }
] as const

const metabaseAdminQuestions = [
  {
    valueType: 'SECRET' as const,
    name: 'OPENCRVS_METABASE_ADMIN_EMAIL',
    type: 'text' as const,
    message:
      'Email for Metabase super admin. Used as a username when logging in to the dashboard',
    valueLabel: 'OPENCRVS_METABASE_ADMIN_EMAIL',
    scope: 'ENVIRONMENT' as const,
    initial: 'user@opencrvs.org'
  },
  {
    valueType: 'SECRET' as const,
    name: 'OPENCRVS_METABASE_ADMIN_PASSWORD',
    type: 'text' as const,
    message: 'Password for Metabase super admin.',
    valueLabel: 'OPENCRVS_METABASE_ADMIN_PASSWORD',
    scope: 'ENVIRONMENT' as const,
    initial: generateLongPassword()
  }
]

ALL_QUESTIONS.push(
  ...githubTokenQuestion,
  ...dockerhubQuestions,
  ...sshQuestions,
  ...sshKeyQuestions,
  ...infrastructureQuestions,
  ...countryQuestions,
  ...databaseAndMonitoringQuestions,
  ...notificationTransportQuestions,
  ...smsQuestions,
  ...emailQuestions,
  ...vpnHostQuestions,
  ...sentryQuestions,
  ...derivedVariables,
  ...metabaseAdminQuestions
)

/*
 * These environment only need a subset of the environment variables
 * as they are not used for application hosting
 */

const SPECIAL_NON_APPLICATION_ENVIRONMENTS = ['jump', 'backup']

;(async () => {
  const { type: environment } = await prompts<string>(
    [
      {
        name: 'type',
        type: 'select' as const,
        scope: 'ENVIRONMENT' as const,
        message: 'Purpose for the environment?',
        choices: [
          { title: 'Quality assurance (no PII data)', value: 'qa' },
          {
            title: 'Staging (hosts PII data, no backups)',
            value: 'staging'
          },
          { title: 'Backup', value: 'backup' },
          {
            title: 'Production (hosts PII data, requires frequent backups)',
            value: 'production'
          },
          { title: 'Jump / Bastion', value: 'jump' },
          { title: 'Other', value: 'development' }
        ]
      }
    ].map(questionToPrompt)
  )

  // Read users .env file based on the environment name they gave above, e.g. .env.production
  dotenv.config({
    path: `${process.cwd()}/.env.${environment}`
  })

  log('\n', kleur.bold().underline('Github'))

  const { githubOrganisation, githubRepository } = await prompts(
    githubQuestions.map(questionToPrompt),
    {
      onCancel: () => {
        process.exit(1)
      }
    }
  )

  const { githubToken } = await promptAndStoreAnswer(
    environment,
    githubTokenQuestion,
    []
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

  log('\n', kleur.bold().underline('SSH'))
  const { sshPort, sshArgs, sshHost } = await promptAndStoreAnswer(
    environment,
    sshQuestions,
    existingValues
  )

  const SSH_KEY_EXISTS = existingValues.find(
    (value) => value.name === 'SSH_KEY' && value.scope === 'ENVIRONMENT'
  )

  if (!SSH_KEY_EXISTS) {
    const sshKey = await editor({
      message: `Paste the SSH private key for ${kleur.cyan(
        'SSH_USER (provision)'
      )} here:`
    })

    const formattedSSHKey = sshKey.endsWith('\n') ? sshKey : sshKey + '\n'
    ALL_ANSWERS.push({ sshKey: formattedSSHKey })
    /*
     * ssh2 library for Node.js doesn't support the same command line parameters
     * as we store in the secrets, thus we cannot reliably do the connection verification here.
     */
    if (!sshArgs) {
      info('Testing SSH connection...')
      try {
        await verifyConnection(sshHost, sshPort, 'provision', formattedSSHKey)
      } catch (err) {
        error(
          'Failed to connect to the target server.',
          'Please try again.',
          'If connecting to the server requires a VPN connection, please connect your VPN client before trying again.',
          'If your connection is via a jump server, please specify the jump server in the SSH_ARGS variable.'
        )
        error('Reason:', err.message)
        process.exit(1)
      }
      success(
        "Successfully connected to the target server's SSH. Now closing connection..."
      )
    }
  }

  log('\n', kleur.bold().underline('Docker Hub'))

  await promptAndStoreAnswer(environment, dockerhubQuestions, existingValues)

  if (SPECIAL_NON_APPLICATION_ENVIRONMENTS.includes(environment)) {
    try {
      await runInteractiveShell(`sh`, [
        join(__dirname, './update-known-hosts.sh'),
        sshHost,
        sshPort
      ])
    } catch (error) {
      warn(
        'Failed to update hosts file. Notice that unknown domains will cause a "host key verification failed" error on deployment.'
      )
    }
  } else {
    log('\n', kleur.bold().underline('Server setup'))
    const { domain } = await promptAndStoreAnswer(
      environment,
      infrastructureQuestions,
      existingValues
    )

    try {
      await runInteractiveShell(`sh`, [
        join(__dirname, './update-known-hosts.sh'),
        domain,
        sshPort
      ])
    } catch (error) {
      warn(
        'Failed to update hosts file. Notice that unknown domains will cause a "host key verification failed" error on deployment.'
      )
    }

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

    log('\n', kleur.bold().underline('METABASE ADMIN'))
    await promptAndStoreAnswer(
      environment,
      metabaseAdminQuestions,
      existingValues
    )

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
    // eslint-disable-next-line no-unused-vars
    fn: (value: string | undefined) => string
  ) => fn(variable || existingValue?.value) || ''

  function findExistingOrDefine(
    name: string,
    type: 'SECRET' | 'VARIABLE',
    scope: 'REPOSITORY' | 'ENVIRONMENT',
    newValue: string
  ) {
    return findExistingValue(name, type, scope, existingValues)
      ? null
      : process.env[name] || newValue
  }

  const derivedUpdates: AnswerWithNullValue[] = [
    {
      name: 'GH_ENCRYPTION_PASSWORD',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'GH_ENCRYPTION_PASSWORD',
        'SECRET',
        'REPOSITORY',
        existingValues
      ),
      value: findExistingOrDefine(
        'GH_ENCRYPTION_PASSWORD',
        'SECRET',
        'REPOSITORY',
        generateLongPassword()
      ),
      scope: 'REPOSITORY' as const
    },
    {
      name: 'SSH_USER',
      type: 'SECRET' as const,
      scope: 'ENVIRONMENT' as const,
      value: 'provision',
      didExist: findExistingValue(
        'SSH_USER',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      )
    }
  ]

  if (['production', 'staging'].includes(environment)) {
    derivedUpdates.push({
      name: 'BACKUP_ENCRYPTION_PASSPHRASE',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'BACKUP_ENCRYPTION_PASSPHRASE',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'BACKUP_ENCRYPTION_PASSPHRASE',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    })
  }

  const applicationServerUpdates = [
    {
      name: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'ELASTICSEARCH_SUPERUSER_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'ELASTICSEARCH_SUPERUSER_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'KIBANA_SYSTEM_PASSWORD',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'KIBANA_SYSTEM_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'KIBANA_SYSTEM_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'MINIO_ROOT_USER',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'MINIO_ROOT_USER',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'MINIO_ROOT_USER',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'MINIO_ROOT_PASSWORD',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'MINIO_ROOT_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'MINIO_ROOT_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'MONGODB_ADMIN_USER',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'MONGODB_ADMIN_USER',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'MONGODB_ADMIN_USER',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'MONGODB_ADMIN_PASSWORD',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'MONGODB_ADMIN_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'MONGODB_ADMIN_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'SUPER_USER_PASSWORD',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'SUPER_USER_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'SUPER_USER_PASSWORD',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
    {
      name: 'ENCRYPTION_KEY',
      type: 'SECRET' as const,
      didExist: findExistingValue(
        'ENCRYPTION_KEY',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      ),
      value: findExistingOrDefine(
        'ENCRYPTION_KEY',
        'SECRET',
        'ENVIRONMENT',
        generateLongPassword()
      ),
      scope: 'ENVIRONMENT' as const
    },
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

  if (!SPECIAL_NON_APPLICATION_ENVIRONMENTS.includes(environment)) {
    derivedUpdates.push(...applicationServerUpdates)
  }

  const updates = getAnswers(existingValues)
    .concat(
      ...derivedUpdates.filter(
        (update): update is Answer => update.value !== null
      )
    )
    .filter(
      (variable) =>
        Boolean(variable.value) &&
        // Only update values that changed
        (variable.type !== 'VARIABLE' ||
          variable.value !== variable.didExist?.value)
    )

  storeSecrets(environment, updates)

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
    newSecrets
      .filter(({ scope }) => scope === 'ENVIRONMENT')
      .forEach((secret) => {
        log(secret.name, '=', secret.value)
      })
    log('')
    log(
      kleur.yellow(`The following secrets will be added to Github repository:`)
    )
    newSecrets
      .filter(({ scope }) => scope === 'REPOSITORY')
      .forEach((secret) => {
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
