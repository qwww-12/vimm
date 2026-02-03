// -------------------- FETCH USER GROUPS --------------------
async function getUserGroups(sock) {
    const chats = Object.values(sock.store.chats || {}) // جميع الدردشات
    const groups = chats.filter(chat => chat.id.endsWith('@g.us')) // غير الجروبات
    return groups.map(g => ({ id: g.id, subject: g?.name || g.id }))
}

// -------------------- ALLGROUP COMMAND --------------------
export async function allgroup(sock, msg) {
    try {
        const userId = msg.key.remoteJid
        const groups = await getUserGroups(sock)

        if (groups.length === 0) {
            await sock.sendMessage(userId, { text: '❌ You are not in any group.' })
            return
        }

        // إنشاء نص الرسالة
        let menuText = '📋 Your WhatsApp groups:\n'
        groups.forEach((g, i) => {
            menuText += `${i + 1}. ${g.subject}\n`
        })

        await sock.sendMessage(userId, { text: menuText })
    } catch (err) {
        console.error('❌ Error in allgroup command:', err)
    }
}
