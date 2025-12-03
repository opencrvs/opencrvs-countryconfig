import { ReqRefDefaults, ServerRoute } from '@hapi/hapi'
import { getIssuerPublicJwk, signBirthCertificateVc } from './sign'
import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'
import { v4 as uuidv4 } from 'uuid'
import { generateCredentialOfferQrDataUrl } from './credential-offer-handler'
import { logger } from '@countryconfig/logger'
import { applicationConfig } from '../application/application-config'

const ISSUER_URI = 'https://23e7e3bf9a52.ngrok-free.app' ?? COUNTRY_CONFIG_URL // e.g. 'http://localhost:3040'
export const ISSUER_DID = `did:web:23e7e3bf9a52.ngrok-free.app`

export default function getVerifiableCredentialRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    // [private (from client)] initiate the credential offer flow
    {
      method: 'POST',
      path: '/vc/offers',
      handler: async (req) => {
        const pathname = (req.payload as Record<string, string>).pathname
        const match = pathname.match(/\/events\/([a-f0-9-]{36})/i)
        const eventId = match?.[1] as string
        logger.info(
          `[verifiable credentials] requesting credential offer for <event-id:${eventId}>`
        )
        const offerId = uuidv4()

        // PoC: not stored anywhere, but good enough for demo
        const credentialOfferUri = `${ISSUER_URI}/openid4vc/offers?offer_id=${offerId}`

        const { dataUrl } =
          await generateCredentialOfferQrDataUrl(credentialOfferUri)

        return {
          credential_offer_uri: credentialOfferUri,
          credential_offer_uri_qr: dataUrl
        }
      },
      options: {
        tags: ['api']
      }
    },

    // [public] did:web resolution
    {
      method: 'GET',
      path: '/.well-known/did.json',
      handler: async () => {
        const publicJwk = await getIssuerPublicJwk()
        return {
          id: ISSUER_DID,
          verificationMethod: [
            {
              id: `${ISSUER_DID}#issuer-key`,
              type: 'JsonWebKey2020',
              controller: ISSUER_DID,
              publicKeyJwk: publicJwk
            }
          ],
          assertionMethod: [`${ISSUER_DID}#issuer-key`]
        }
      },
      options: { auth: false, tags: ['api'] }
    },

    // [public] .well-known path for the wallet to know where to fetch token and the credential
    {
      method: 'GET',
      path: '/.well-known/openid-credential-issuer',
      handler: () => ({
        credential_issuer: ISSUER_URI, // base for VC issuer
        credential_endpoint: `${ISSUER_URI}/openid4vc/credential`,
        token_endpoint: `${ISSUER_URI}/openid4vc/token`,
        display: [
          {
            name: applicationConfig.APPLICATION_NAME,
            logo: {
              uri: 'https://www.opencrvs.org/apple-touch-icon.png',
              alt_text: 'Logo of OpenCRVS',
              url: 'https://www.opencrvs.org/apple-touch-icon.png'
            }
          }
        ],
        credential_configurations_supported: {
          BirthCertificateCredential: {
            format: 'jwt_vc_json',
            types: ['VerifiableCredential', 'BirthCertificateCredential'],

            credential_definition: {
              type: ['VerifiableCredential', 'BirthCertificateCredential'],
              schema: {
                // PoC: ANY URL is fine; wallet only checks existence
                id: 'https://schemas.opencrvs.org/birth-certificate.json',
                type: 'JsonSchemaValidator2018'
              }
            },

            proof_types_supported: {
              jwt: {
                proof_signing_alg_values_supported: ['ES256']
              }
            },
            display: [
              {
                name: 'Birth certificate',
                background_color: '#cbe6ff',
                text_color: '#000f66'
              }
            ]
          }
        }
      }),
      options: {
        auth: false,
        tags: ['api']
      }
    },

    // [public] offer url for the wallet to get pre-authorized code for token
    {
      method: 'GET',
      path: '/openid4vc/offers',
      handler: (req) => {
        const { offer_id } = req.query as { offer_id?: string }

        // PoC: no validation, just echo back offer_id as pre-authorized_code
        return {
          credential_issuer: ISSUER_URI,
          credential_configuration_ids: ['BirthCertificateCredential'],
          grants: {
            'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
              'pre-authorized_code': offer_id,
              user_pin_required: false
            }
          }
        }
      },
      options: {
        auth: false,
        tags: ['api']
      }
    },

    // [public] token url to exchange pre-authorized-code to a JWT
    {
      method: 'POST',
      path: '/openid4vc/token',
      handler: (req) => {
        // PoC: ignore grant_type and code, just return a bogus access_token
        // In real impl, you'd read req.payload.grant_type and pre-authorized_code

        const cNonce = uuidv4() // PoC: not stored / validated
        return {
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
          token_type: 'Bearer',
          expires_in: 600,
          c_nonce: cNonce,
          c_nonce_expires_in: 600
        }
      },
      options: {
        auth: false,
        tags: ['api']
      }
    },

    // [public] the url the wallet eventually fetches the credential from
    {
      method: 'POST',
      path: '/openid4vc/credential',
      handler: async () => {
        // PoC: ignore Authorization header and just return a VC for a random ID
        const vcJwt = await signBirthCertificateVc(uuidv4())

        return {
          format: 'jwt_vc_json',
          credential: vcJwt
        }
      },
      options: {
        auth: false,
        tags: ['api']
      }
    }
  ]
}
