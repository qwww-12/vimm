export async function tag(msg, sock) {
    try {
        const groupId = msg.key.remoteJid
        if (!groupId.endsWith('@g.us')) {
            console.log('not grop')
            return
        }

        const groupMetadata = await sock.groupMetadata(groupId)
        const participants = groupMetadata.participants.map(p => p.id)

        const messageText = 'lol'

        await sock.sendMessage(groupId, {
            text: messageText,
            mentions: participants
        })

        console.log('done')
    } catch (err) {
        console.error('error', err)
    }
}
