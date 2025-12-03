import { v4 as uuidv4 } from 'uuid'
import { ISSUER_DID } from './verifiable-credential-routes'

// unknown=KeyLike & unknown=JWK but some type error
let keyPairPromise: Promise<{
  privateKey: unknown
  publicJwk: unknown
}> | null = null

async function getKeyPair() {
  if (!keyPairPromise) {
    keyPairPromise = (async () => {
      const { generateKeyPair, exportJWK } = await import('jose')
      const { privateKey, publicKey } = await generateKeyPair('ES256')
      const publicJwk = await exportJWK(publicKey)
      publicJwk.alg = 'ES256'
      publicJwk.use = 'sig'
      return { privateKey, publicJwk }
    })()
  }
  return keyPairPromise
}

export async function getIssuerPublicJwk() {
  const { publicJwk } = await getKeyPair()
  return publicJwk
}

export async function signBirthCertificateVc(subjectId: string) {
  const { SignJWT } = await import('jose')
  const { privateKey } = await getKeyPair()

  const now = Math.floor(Date.now() / 1000)
  const exp = now + 10 * 365 * 24 * 60 * 60 // 10 years PoC

  const subject = `urn:uuid:${subjectId}` // credentialSubject.id and sub needs to match!
  const jti = `urn:uuid:${uuidv4()}` // vc.id and jti needs to match!

  const vcPayload = {
    iss: ISSUER_DID,
    sub: subject,
    nbf: now,
    iat: now,
    exp,
    jti: jti,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: jti,
      type: ['VerifiableCredential', 'BirthCertificateCredential'],
      credentialSubject: {
        id: subject,
        givenName: 'Pyry',
        familyName: 'Rouvila',
        dateOfBirth: '1998-01-01',
        placeOfBirth: 'Helsinki, Finland'
      },

      // PARADYM ONLY BUG FIX -->
      proof: {
        type: 'DataIntegrityProof',
        cryptosuite: 'ES256',
        verificationMethod: `${ISSUER_DID}#issuer-key`,
        proofPurpose: 'assertionMethod',
        created: new Date(now * 1000).toISOString()
      }
    }
  }

  return new SignJWT(vcPayload)
    .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
    .sign(privateKey)
}
