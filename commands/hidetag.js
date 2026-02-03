function ask(question) {
    return new Promise(resolve => {
        process.stdout.write(question)
        process.stdin.once('data', data => resolve(data.toString().trim()))
    })
}

export async function hidetag(sock, msg, text) {
    try {
        if (!sock || !sock.user) {
            console.log('❌ WhatsApp not connected yet. Please wait...')
            return
        }

        const groupsData = await sock.groupFetchAllParticipating()
        const groups = Object.values(groupsData).map(g => ({
            id: g.id,
            subject: g.subject
        }))

        if (groups.length === 0) {
            console.log('❌ No groups found')
            return
        }

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

        const messageText = text.slice(9);

        await sock.sendMessage(groupId, {
            text: messageText,
            mentions: participants
        })

        console.log(`✅ Message sent and tagged all ${participants.length} members in ${groups[groupIndex].subject}`)
    } catch (err) {
        console.error('❌ Error in hidetag function:', err.message)
        
        if (err.message.includes('not-authorized')) {
            console.log('💡 Try re-authenticating by deleting ./auth-session folder')
        }
    }
}
