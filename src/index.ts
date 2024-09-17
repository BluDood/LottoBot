import 'dotenv/config'
import { Client, Collection, Events, IntentsBitField } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { deploy } from './lib/deploy.js'

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates
  ]
})

client.commands = new Collection()

const dirname = path
  .dirname(import.meta.url)
  .replace(`file://${process.platform === 'win32' ? '/' : ''}`, '')

const commandFiles = fs
  .readdirSync(path.join(dirname, 'commands'))
  .filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = await import(
    path.join('file://', dirname, 'commands', file)
  )
  if (command.disabled || !command.data || !command.execute) continue
  client.commands.set(command.data.name, command)
}

client.on('ready', async c => {
  console.log(`Logged in as ${client.user?.tag}`)

  await deploy(c.user.id)
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.guildId) return

  if (interaction.guildId !== process.env.GUILD_ID) return

  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(
      interaction.commandName
    )
    if (command) await command.execute(interaction).catch(console.error)
  }
})

client.login(process.env.TOKEN)
