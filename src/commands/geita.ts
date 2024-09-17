import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnectionStatus
} from '@discordjs/voice'

import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder
} from 'discord.js'

import path from 'path'
import { fileURLToPath } from 'url'

export const data = new SlashCommandBuilder()
  .setName('geita')
  .setDescription('Play albin leaked ep')

export async function execute(interaction: ChatInputCommandInteraction) {
  if (getVoiceConnection(interaction.guildId!))
    return await interaction.reply('Jeg er allerede i en kanal!')

  const member = interaction.member as GuildMember
  const channel = member.voice.channel

  const resource = createAudioResource(
    path.join(fileURLToPath(import.meta.url), '../../../audio/albin.mp3')
  )
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause
    }
  })

  if (!channel)
    return await interaction.reply('Du må være i en voice-kanal!')

  if (!channel.joinable)
    return await interaction.reply('Jeg kan ikke joine denne kanalen!')

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  })

  player.on('stateChange', (oldState, newState) => {
    if (newState.status === AudioPlayerStatus.Idle) {
      connection.destroy()
      player.stop()
    }
  })

  connection.on('stateChange', (oldState, newState) => {
    if (newState.status === VoiceConnectionStatus.Disconnected) {
      connection.destroy()
      player.stop()
    }
  })

  player.on('error', e => console.log(e))

  connection.on('error', e => console.log(e))

  player.play(resource)

  connection.subscribe(player)
  await interaction.reply('Spiller av Albin sin lekkede EP')
}
