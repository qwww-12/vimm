import * as baileys from "@whiskeysockets/baileys"
import P from "pino"
import qrcode from "qrcode-terminal"

const { makeWASocket, useMultiFileAuthState } = baileys

async function startWhatsApp() {
    // هنا غادي نخزنو الجلسة
    const { state, saveCreds } = await useMultiFileAuthState("./auth-session")

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    })

    // تحديث الجلسة
    sock.ev.on("creds.update", saveCreds)

    // متابعة حالة الاتصال و QR
    sock.ev.on("connection.update", update => {
        const { connection, qr } = update
        if (qr) {
            qrcode.generate(qr, { small: true })
            console.log("✅ Scan this QR code with WhatsApp")
        }
        if (connection === "open") console.log("✅ Connected to WhatsApp")
        if (connection === "close") console.log("❌ Connection closed")
    })

    // التعامل مع الرسائل
    sock.ev.on("messages.upsert", async m => {
        const msg = m.messages[0]
        if (!msg.message) return

        // جلب النص من الرسالة
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        console.log(`[MSG] ${msg.key.remoteJid}: ${text}`)

        if (text === ".menu") {
            console.log("========= vimm ===========")
            console.log(" hello vimm")

            // اختيار jid صالح سواء DM أو Group
            const jid = msg.key.remoteJid.includes("@g.us") 
                        ? msg.key.remoteJid 
                        : msg.key.participant || msg.key.remoteJid

            // إرسال الرد مع catch لتجنب crash
            try {
                await sock.sendMessage(jid, { text: "Hello vimm" })
            } catch (err) {
                console.log("❌ Error sending message:", err.message)
            }
        }
    })
}

startWhatsApp()
