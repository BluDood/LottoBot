import {
  Collection,
  CommandInteraction,
  SlashCommandBuilder
} from 'discord.js'

interface SlashCommand {
  data: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<void>
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, SlashCommand>
  }
}
