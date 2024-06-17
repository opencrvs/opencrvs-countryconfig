import { NodeSSH } from 'node-ssh'

export async function verifyConnection(
  host: string,
  port: number,
  username: string,
  privateKey: string
) {
  const ssh = new NodeSSH()

  await ssh.connect({
    host,
    username,
    port,
    privateKey: privateKey ? privateKey : undefined
  })
  await ssh.dispose()
}
