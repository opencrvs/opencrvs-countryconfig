const sodium = require('libsodium-wrappers')
import { Octokit } from '@octokit/core'

export async function createVariable(
  octokit: Octokit,
  repositoryId: number,
  environment: string,
  name: string,
  value: string
): Promise<void> {
  await octokit.request(
    `POST /repositories/${repositoryId}/environments/${environment}/variables`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}
export async function updateVariable(
  octokit: Octokit,
  repositoryId: number,
  environment: string,
  name: string,
  value: string
): Promise<void> {
  await octokit.request(
    `PATCH /repositories/${repositoryId}/environments/${environment}/variables/${name}`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function getRepositoryId(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number> {
  const response = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: owner,
    repo: repo
  })

  return response.data.id
}

export async function createSecret(
  octokit: Octokit,
  repositoryId: number,
  environment: string,
  key: string,
  keyId: string,
  name: string,
  secret: string
): Promise<void> {
  //Check if libsodium is ready and then proceed.
  await sodium.ready

  // Convert Secret & Base64 key to Uint8Array.
  const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  const binsec = sodium.from_string(secret)

  //Encrypt the secret using LibSodium
  const encBytes = sodium.crypto_box_seal(binsec, binkey)

  // Convert encrypted Uint8Array to Base64
  const encryptedValue = sodium.to_base64(
    encBytes,
    sodium.base64_variants.ORIGINAL
  )

  await octokit.request(
    `PUT /repositories/${repositoryId}/environments/${environment}/secrets/${name}`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      secret_name: name,
      encrypted_value: encryptedValue,
      key_id: keyId,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function getPublicKey(
  octokit: Octokit,
  environment: string,
  ORGANISATION: string,
  REPOSITORY_NAME: string
): Promise<any> {
  const repositoryId = await getRepositoryId(
    octokit,
    ORGANISATION,
    REPOSITORY_NAME
  )

  await octokit.request(
    `PUT /repos/${ORGANISATION}/${REPOSITORY_NAME}/environments/${environment}`,
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  const res = await octokit.request(
    `GET /repositories/${repositoryId}/environments/${environment}/secrets/public-key`,
    {
      owner: ORGANISATION,
      repo: REPOSITORY_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return res.data
}
export type Secret = { type: 'SECRET'; name: string }
export type Variable = { type: 'VARIABLE'; name: string; value: string }

export async function listRepoSecrets(
  octokit: Octokit,
  owner: string,
  repositoryId: number,
  environmentName: string
): Promise<Secret[]> {
  const response = await octokit.request(
    'GET /repositories/{repository_id}/environments/{environment_name}/secrets',
    {
      owner: owner,
      repository_id: repositoryId,
      environment_name: environmentName
    }
  )
  return response.data.secrets.map((secret) => ({ ...secret, type: 'SECRET' }))
}

export async function listRepoVariables(
  octokit: Octokit,
  repositoryId: number,
  environmentName: string
): Promise<Variable[]> {
  const response = await octokit.request(
    'GET /repositories/{repository_id}/environments/{environment_name}/variables',
    {
      per_page: 30,
      repository_id: repositoryId,
      environment_name: environmentName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return response.data.variables.map((variable) => ({
    ...variable,
    type: 'VARIABLE'
  }))
}
