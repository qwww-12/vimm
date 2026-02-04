export async function menu(msg, sock){
    const jid = msg.key.remoteJid.includes("@g.us") 
    ? msg.key.remoteJid 
    : msg.key.participant || msg.key.remoteJid

    const menu = `
    *⚡ VIMM SYSTEM ⚡*

    👤 *User:* ${sock.user.name}
    🏷️ *Owner:* Ayoub
    🌐 *Mode:* Public
    ⚙️ *Version:* 0.1
    
    ────────────────────
    
    🛡️ *ADMIN & MODERATION*
    • .add
    • .promote
    • .demote
    • .kick
    • .ban / .unban
    • .warn / .resetwarn
    • .mute / .unmute
    
    💬 *GROUP TOOLS*
    • .groupinfo
    • .tagall
    • .hidetag
    • .link
    • .invite
    
    ⚙️ *AUTOMATION*
    • .autoread
    • .autotyping
    • .autorecording
    
    🌸 *ANIME & FUN*
    • .waifu
    • .hug
    • .kiss
    • .dance
    • .wink
    
    ────────────────────
    
    ╮──────────────╭
                              🤖 𝙑𝙄𝙈𝙈 𝘼𝙄 𝘽𝙊𝙏   
                 ╯──────────────╰
    `;
    

    try {
        await sock.sendMessage(jid, { text: menu})
    } catch (err) {
    console.log("Error sending message:", err.message)
    }
}
