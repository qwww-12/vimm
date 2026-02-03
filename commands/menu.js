export async function menu(msg, sock){
    const jid = msg.key.remoteJid.includes("@g.us") 
    ? msg.key.remoteJid 
    : msg.key.participant || msg.key.remoteJid

    try {
        await sock.sendMessage(jid, { text: "          **Vimm Boot**          \n\n\n -> *Owner:* `Ayoub`" })
    } catch (err) {
    console.log("Error sending message:", err.message)
    }
}
