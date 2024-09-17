import fs from 'fs'
import {
  Routes,
  REST,
  RESTGetAPIApplicationGuildCommandsResult
} from 'discord.js'
import path from 'path'

const { TOKEN, GUILD_ID } = process.env

export const deploy = async (id: string) => {
  const base = path.dirname(
    path
      .dirname(import.meta.url)
      .replace(`file://${process.platform === 'win32' ? '/' : ''}`, '')
  )

  const commands = []
  const commandFiles = fs
    .readdirSync(path.join(base, 'commands'))
    .filter(file => file.endsWith('.js'))

  for (const file of commandFiles) {
    const command = await import(
      path.join('file://', base, 'commands', file)
    )
    if (command.disabled || !command.data || !command.execute) continue
    commands.push(command.data.toJSON())
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN!)

  const old = (await rest.get(
    Routes.applicationGuildCommands(id, GUILD_ID!)
  )) as RESTGetAPIApplicationGuildCommandsResult

  const res = (await rest
    .put(Routes.applicationGuildCommands(id, GUILD_ID!), {
      body: commands
    })
    .catch(err => ({ err }))) as { err?: string }

  if (!res.err) {
    console.log('Successfully deployed guild commands.')
  } else {
    console.log(`Failed to deploy commands: ${res.err}`)
  }
}
