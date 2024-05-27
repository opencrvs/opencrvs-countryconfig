import { NodeSSH } from 'node-ssh'

export async function verifyConnection(
  host: string,
  username: string,
  privateKey: string
) {
  const ssh = new NodeSSH()

  await ssh.connect({
    host,
    username,
    privateKey: privateKey ? privateKey : undefined
  })
  await ssh.dispose()
}
