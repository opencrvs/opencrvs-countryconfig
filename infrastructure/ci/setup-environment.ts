import { Octokit } from '@octokit/core'
import { PromptObject } from 'prompts'
import prompts from 'prompts'

import kleur from 'kleur'
import {
  Variable,
  Secret,
  getPublicKey,
  getRepositoryId,
  listRepoSecrets,
  listRepoVariables,
  createSecret,
  createVariable,
  updateVariable
} from './github'

import editor from '@inquirer/editor'
import { writeFileSync } from 'fs'

const notEmpty = (value: string | number) =>
  value.toString().trim().length > 0 ? true : 'Please enter a value'

type Question<T extends string> = PromptObject<T> & {
  name: T
  valueType?: 'SECRET' | 'VARIABLE'
  valueLabel?: string
}

type SecretAnswer = {
  type: 'SECRET'
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
  ...promptOptions
}: Question<T>): PromptObject<T> {
  return promptOptions
}

// eslint-disable-next-line no-console
const log = console.log

const ALL_QUESTIONS: Array<Question<any>> = []
const ALL_ANSWERS: Array<Record<string, string>> = []

function findExistingValue<T extends string>(
  name: string,
  type: T,
  existingValues: Array<Secret | Variable>
) {
  return existingValues.find(
    (value) => value.name === name && value.type === type
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
        existingValues
      )
      if (existingVariable) {
        return [
          {
            name: 'overWrite' + questionWithVariableLabel.name,
            type: 'confirm' as const,
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
        existingValues
      )

      if (existingSecret) {
        return [
          {
            name: 'overWrite' + questionWithVariableLabel.name,
            type: 'confirm' as const,
            message: `${kleur.yellow(
              `Secret ${kleur.cyan(
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

  ALL_QUESTIONS.push(...questions)
  const result = await prompts(processedQuestions.map(questionToPrompt), {
    onCancel: () => {
      process.exit(1)
    }
  })
  ALL_ANSWERS.push(result)
  storeSecrets(environment, getAnswers(existingValues))
  return result
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
    answers.map((update) => `${update.name}=${update.value}`).join('\n')
  )
}

;(async () => {
  const { environment, type } = await prompts(
    [
      {
        name: 'environment',
        type: 'text' as const,
        message: 'What is the environment name?',
        validate: notEmpty
      },
      {
        name: 'type',
        type: 'select' as const,
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

  // Read users .env file based on the environment name they gave above, e.g. .env.production
  require('dotenv').config({
    path: `${process.cwd()}/.env.${environment}`
  })

  log('\n', kleur.bold().underline('Github'))

  const githubQuestions = [
    {
      name: 'githubOrganisation',
      type: 'text',
      message: 'What is the name of your Github organisation?',
      validate: notEmpty,
      initial: process.env.GITHUB_ORGANISATION
    },
    {
      name: 'githubRepository',
      type: 'text',
      message: 'What is your Github repository?',
      validate: notEmpty,
      initial: process.env.GITHUB_REPOSITORY
    },
    {
      name: 'githubToken',
      type: 'text',
      message: 'What is your Github token?',
      validate: notEmpty,
      initial: process.env.GITHUB_TOKEN
    }
  ] as const

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

  const { key, key_id } = await getPublicKey(
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

  const existingVariables = await listRepoVariables(
    octokit,
    repositoryId,
    environment
  )

  const existingSecrets = await listRepoSecrets(
    octokit,
    githubOrganisation,
    repositoryId,
    environment
  )

  const existingValues = [...existingVariables, ...existingSecrets]

  if (existingVariables.length > 0 || existingSecrets.length > 0) {
    log(
      '\nEnvironment with the name',
      environment,
      'already exists in Github.\n',
      'Found',
      existingVariables.length,
      'existing variables and',
      existingSecrets.length,
      'secrets'
    )
  } else {
    log(kleur.green('\nSuccessfully logged in to Github\n'))
  }

  log('\n', kleur.bold().underline('Docker Hub'))

  const dockerhubQuestions = [
    {
      name: 'dockerhubOrganisation',
      type: 'text' as const,
      message: 'What is the name of your Docker Hub organisation?',
      valueType: 'SECRET' as const,
      valueLabel: 'DOCKERHUB_ACCOUNT',
      validate: notEmpty,
      initial: process.env.DOCKER_ORGANISATION
    },
    {
      name: 'dockerhubRepository',
      type: 'text' as const,
      message: 'What is the name of your private Docker Hub repository?',
      valueType: 'SECRET' as const,
      valueLabel: 'DOCKERHUB_REPO',
      validate: notEmpty,
      initial: process.env.DOCKER_REPO
    },
    {
      name: 'dockerhubUsername',
      type: 'text' as const,
      message:
        'What is the Docker Hub username the the target server should be using?',
      valueType: 'SECRET' as const,
      valueLabel: 'DOCKER_USERNAME',
      validate: notEmpty,
      initial: process.env.DOCKER_USERNAME
    },
    {
      name: 'dockerhubToken',
      type: 'text' as const,
      message: 'What is the token of this Docker Hub account?',
      valueType: 'SECRET' as const,
      valueLabel: 'DOCKER_TOKEN',
      validate: notEmpty,
      initial: process.env.DOCKER_TOKEN
    }
  ]

  await promptAndStoreAnswer(environment, dockerhubQuestions, existingValues)

  const sshQuestions = [
    {
      name: 'sshHost',
      type: 'text' as const,
      message:
        'What is the target server IP address? Note: For "production" environment server clusters of (2, 3 or 5 replicas) this is always the IP address for just 1 manager server',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'SSH_HOST',
      initial: process.env.SSH_HOST
    },
    {
      name: 'sshUser',
      type: 'text' as const,
      message: 'What is the SSH login user to be used for provisioning?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'SSH_USER',
      initial: process.env.SSH_USER || 'provision'
    },
    {
      name: 'sshArgs',
      type: 'text' as const,
      message:
        'Specify any additional SSH arguments to be used when connecting to the target machine. For example, if you need to connect via a jump server, you can specify the jump server here.',
      valueType: 'VARIABLE' as const,
      valueLabel: 'SSH_ARGS',
      format: (value: string) => value.trim(),
      initial: process.env.SSH_ARGS
    }
  ]
  log('\n', kleur.bold().underline('SSH'))
  const { sshUser } = await promptAndStoreAnswer(
    environment,
    sshQuestions,
    existingValues
  )

  ALL_QUESTIONS.push({
    name: 'sshKey',
    type: 'text' as const,
    message: `Paste the SSH private key for ${sshUser} here:`,
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSH_KEY',
    initial: process.env.SSH_KEY
  })

  const SSH_KEY_EXISTS = existingValues.find(
    (value) => value.name === 'SSH_KEY'
  )

  if (!SSH_KEY_EXISTS) {
    const sshKey = await editor({
      message: `Paste the SSH private key for ${kleur.cyan('SSH_USER')} here:`
    })

    ALL_ANSWERS.push({ sshKey })
  }

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
      initial: process.env.DISK_SPACE || '200g'
    },
    {
      name: 'domain',
      type: 'text' as const,
      message: 'What is the web domain applied after all subdomains in URLs?',
      valueType: 'VARIABLE' as const,
      validate: notEmpty,
      valueLabel: 'DOMAIN',
      initial: process.env.DOMAIN
    },
    {
      name: 'replicas',
      type: 'number' as const,
      message:
        'What is the number of replicas? EDIT: This should be 1 for qa, staging and backup environments.  For "production" environment server clusters of (2, 3 or 5 replicas), set to 2, 3 or 5 as appropriate.',
      valueType: 'VARIABLE' as const,
      validate: notEmpty,
      valueLabel: 'REPLICAS',
      initial: process.env.REPLICAS ? parseInt(process.env.REPLICAS, 10) : 1
    }
  ]

  log('\n', kleur.bold().underline('Server setup'))
  await promptAndStoreAnswer(
    environment,
    infrastructureQuestions,
    existingValues
  )

  log('\n', kleur.bold().underline('Databases & monitoring'))

  await promptAndStoreAnswer(
    environment,
    [
      {
        name: 'kibanaUsername',
        type: 'text' as const,
        message: 'Input the username for logging in to Kibana',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'KIBANA_USERNAME',
        initial: process.env.KIBANA_USERNAME || 'opencrvs-admin'
      },
      {
        name: 'kibanaPassword',
        type: 'text' as const,
        message: 'Input the password for logging in to Kibana',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'KIBANA_PASSWORD',
        initial: process.env.KIBANA_PASSWORD || generateLongPassword()
      },
      {
        name: 'elasticsearchSuperuserPassword',
        type: 'text' as const,
        message: 'Input the password for the Elasticsearch superuser',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
        initial:
          process.env.ELASTICSEARCH_SUPERUSER_PASSWORD || generateLongPassword()
      },
      {
        name: 'minioRootUser',
        type: 'text' as const,
        message: 'Input the username for the Minio root user',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'MINIO_ROOT_USER',
        initial: process.env.MINIO_ROOT_USER || generateLongPassword()
      },
      {
        name: 'minioRootPassword',
        type: 'text' as const,
        message: 'Input the password for the Minio root user',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'MINIO_ROOT_PASSWORD',
        initial: process.env.MINIO_ROOT_PASSWORD || generateLongPassword()
      },
      {
        name: 'mongodbAdminUser',
        type: 'text' as const,
        message: 'Input the username for the MongoDB admin user',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'MONGODB_ADMIN_USER',
        initial: process.env.MONGODB_ADMIN_USER || generateLongPassword()
      },
      {
        name: 'mongodbAdminPassword',
        type: 'text' as const,
        message: 'Input the password for the MongoDB admin user',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'MONGODB_ADMIN_PASSWORD',
        initial: process.env.MONGODB_ADMIN_PASSWORD || generateLongPassword()
      },
      {
        name: 'superUserPassword',
        type: 'text' as const,
        message: 'Input the password for the OpenCRVS super user',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'SUPER_USER_PASSWORD',
        initial: process.env.SUPER_USER_PASSWORD || generateLongPassword()
      }
    ],
    existingValues
  )
  log('\n', kleur.bold().underline('Sentry'))
  const { useSentry } = await prompts(
    [
      {
        name: 'useSentry',
        type: 'confirm' as const,
        message: 'Do you want to use Sentry?',
        initial: Boolean(process.env.SENTRY_DNS)
      }
    ].map(questionToPrompt)
  )

  if (useSentry) {
    await promptAndStoreAnswer(
      environment,
      [
        {
          name: 'sentryDsn',
          type: 'text',
          message: 'What is your Sentry DSN?',
          valueType: 'SECRET' as const,
          validate: notEmpty,
          valueLabel: 'SENTRY_DSN',
          initial: process.env.SENTRY_DSN
        }
      ],
      existingValues
    )
  }

  if (['production', 'staging'].includes(type)) {
    const backupQuestions = [
      {
        name: 'backupHost',
        type: 'text' as const,
        message: 'What is your backup host IP address?',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'BACKUP_HOST',
        initial: process.env.BACKUP_HOST
      },
      {
        name: 'backupSshUser',
        type: 'text' as const,
        message:
          'What user should application servers use to login to the backup server?',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'BACKUP_SSH_USER',
        initial: process.env.BACKUP_SSH_USER
      },
      {
        name: 'backupDirectory',
        type: 'text' as const,
        message:
          'What is the full path to a directory on your backup server where encrypted backups will be stored?',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'BACKUP_DIRECTORY',
        initial: process.env.BACKUP_DIRECTORY
      },
      {
        name: 'backupEncryptionPassprase',
        type: 'text' as const,
        message:
          'Input a long random passphrase to be used for encrypting backups',
        valueType: 'SECRET' as const,
        validate: notEmpty,
        valueLabel: 'BACKUP_ENCRYPTION_PASSPHRASE',
        initial:
          process.env.BACKUP_ENCRYPTION_PASSPHRASE || generateLongPassword()
      }
    ]
    log('\n', kleur.bold().underline('Backups'))
    await promptAndStoreAnswer(environment, backupQuestions, existingValues)

    log('\n', kleur.bold().underline('VPN'))
    const { vpnEnabled } = await prompts(
      [
        {
          name: 'vpnEnabled',
          type: 'confirm' as const,
          message: `Do you want to setup a VPN (Wireguard) to connect to your ${type} environment?`,
          initial: true
        }
      ].map(questionToPrompt)
    )

    if (vpnEnabled) {
      const vpnQuestions = [
        {
          name: 'vpnHostAddress',
          type: 'text' as const,
          message: `Please enter the IP address users logged in to the VPN will use`,
          initial: true,
          valueType: 'VARIABLE' as const,
          valueLabel: 'VPN_HOST_ADDRESS'
        },
        {
          name: 'vpnAdminPassword',
          type: 'text' as const,
          message: `Admin password for Wireguard UI`,
          initial: generateLongPassword(),
          valueType: 'VARIABLE' as const,
          valueLabel: 'VPN_ADMIN_PASSWORD'
        }
      ]

      await promptAndStoreAnswer(environment, vpnQuestions, existingValues)
    }
  }

  const smsQuestions = [
    {
      name: 'infobipApiKey',
      type: 'text' as const,
      message: 'What is your Infobip API key?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'INFOBIP_API_KEY',
      initial: process.env.INFOBIP_API_KEY
    },
    {
      name: 'infobipGatewayEndpoint',
      type: 'text' as const,
      message: 'What is your Infobip gateway endpoint?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'INFOBIP_GATEWAY_ENDPOINT',
      initial: process.env.INFOBIP_GATEWAY_ENDPOINT
    },
    {
      name: 'infobipSenderId',
      type: 'text' as const,
      message: 'What is your Infobip sender ID?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'INFOBIP_SENDER_ID',
      initial: process.env.INFOBIP_SENDER_ID
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
      initial: process.env.SMTP_HOST
    },
    {
      name: 'smtpUsername',
      type: 'text' as const,
      message: 'What is your SMTP username?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'SMTP_USERNAME',
      initial: process.env.SMTP_USERNAME
    },
    {
      name: 'smtpPassword',
      type: 'text' as const,
      message: 'What is your SMTP password?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'SMTP_PASSWORD',
      initial: process.env.SMTP_PASSWORD
    },
    {
      name: 'smtpPort',
      type: 'text' as const,
      message: 'What is your SMTP port?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'SMTP_PORT',
      initial: process.env.SMTP_PORT
    },
    {
      name: 'senderEmailAddress',
      type: 'text' as const,
      message: 'What is your sender email address?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'SENDER_EMAIL_ADDRESS',
      initial: process.env.SENDER_EMAIL_ADDRESS
    },
    {
      name: 'alertEmail',
      type: 'text' as const,
      message:
        'What is the email address to receive alert emails or a Slack channel email link?',
      valueType: 'SECRET' as const,
      validate: notEmpty,
      valueLabel: 'ALERT_EMAIL',
      initial: process.env.ALERT_EMAIL
    }
  ]

  log('\n', kleur.bold().underline('SMTP'))
  await promptAndStoreAnswer(environment, emailQuestions, existingValues)

  log('\n', kleur.bold().underline('Notification'))
  const { notificationTransport } = await prompts(
    [
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
        valueType: 'VARIABLE' as const
      }
    ].map(questionToPrompt)
  )

  if (notificationTransport.includes('sms')) {
    await promptAndStoreAnswer(environment, smsQuestions, existingValues)
  }

  const allAnswers = ALL_ANSWERS.reduce((acc, answer) => {
    return { ...acc, ...answer }
  })

  const updates: Answers = getAnswers(existingValues)

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
      didExist: findExistingValue('ACTIVATE_USERS', 'VARIABLE', existingValues)
    },
    {
      type: 'VARIABLE' as const,
      name: 'AUTH_HOST',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', existingValues),
        (val) => `https://auth.${val}`
      ),
      didExist: findExistingValue('AUTH_HOST', 'VARIABLE', existingValues)
    },
    {
      type: 'VARIABLE' as const,
      name: 'COUNTRY_CONFIG_HOST',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', existingValues),
        (val) => `https://countryconfig.${val}`
      ),
      didExist: findExistingValue(
        'COUNTRY_CONFIG_HOST',
        'VARIABLE',
        existingValues
      )
    },
    {
      type: 'VARIABLE' as const,
      name: 'GATEWAY_HOST',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', existingValues),
        (val) => `https://gateway.${val}`
      ),
      didExist: findExistingValue('GATEWAY_HOST', 'VARIABLE', existingValues)
    },
    {
      type: 'VARIABLE' as const,
      name: 'CONTENT_SECURITY_POLICY_WILDCARD',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', existingValues),
        (val) => `*.${val}`
      ),
      didExist: findExistingValue(
        'CONTENT_SECURITY_POLICY_WILDCARD',
        'VARIABLE',
        existingValues
      )
    },
    {
      type: 'VARIABLE' as const,
      name: 'CLIENT_APP_URL',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', existingValues),
        (val) => `https://register.${val}`
      ),
      didExist: findExistingValue('CLIENT_APP_URL', 'VARIABLE', existingValues)
    },
    {
      type: 'VARIABLE' as const,
      name: 'LOGIN_URL',
      value: answerOrExisting(
        allAnswers.domain,
        findExistingValue('DOMAIN', 'VARIABLE', existingValues),
        (val) => `https://login.${val}`
      ),
      didExist: findExistingValue('LOGIN_URL', 'VARIABLE', existingValues)
    }
  ]

  updates.push(...derivedUpdates.filter((variable) => Boolean(variable.value)))

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
    await createSecret(
      octokit,
      repositoryId,
      environment,
      key,
      key_id,
      newSecret.name,
      newSecret.value
    )
  }
  for (const updatedSecret of updatedSecrets) {
    log(
      `Updating secret ${updatedSecret.name} with value ${updatedSecret.value}`
    )
    await createSecret(
      octokit,
      repositoryId,
      environment,
      key,
      key_id,
      updatedSecret.name,
      updatedSecret.value
    )
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
          existingValues
        )
        return {
          type: valueType,
          name: existingQuestion?.valueLabel!,
          value: value.toString(),
          didExist: existingSecret
        }
      }

      return {
        type: valueType,
        name: existingQuestion?.valueLabel!,
        didExist: findExistingValue(
          existingQuestion?.valueLabel!,
          valueType,
          existingValues
        ),
        value: value.toString()
      }
    })
  })
}
