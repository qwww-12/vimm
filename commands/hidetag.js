function ask(question) {
    return new Promise(resolve => {
        process.stdout.write(question)
        process.stdin.once('data', data => resolve(data.toString().trim()))
    })
}

export async function hidetag(sock) {
    try {
        const groups = [
            { id: '120363407040917079@g.us', subject: 'Group 1' },
            { id: '120363409801259587@g.us', subject: 'Group 2' }
        ]

        console.log('📋 Your groups:')
        groups.forEach((g, i) => console.log(`${i + 1}. ${g.subject}`))

        const choice = await ask('Enter the number of the group to hidetag: ')
        const groupIndex = parseInt(choice) - 1
        if (groupIndex < 0 || groupIndex >= groups.length) {
            console.log('❌ Invalid number')
            return
        }

        const groupId = groups[groupIndex].id

        const groupMetadata = await sock.groupMetadata(groupId)
        const participants = groupMetadata.participants.map(p => p.id)

        const messageText = 'Hello everyone! 👋'

        await sock.sendMessage(groupId, {
            text: messageText,
            mentions: participants
        })

        console.log(`✅ Message sent and tagged all ${participants.length} members in ${groups[groupIndex].subject}`)
    } catch (err) {
        console.error('❌ Error in hidetag function:', err)
    }
}
