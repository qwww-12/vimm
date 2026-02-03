import * as baileys from "@whiskeysockets/baileys"
import P from "pino"
import qrcode from "qrcode-terminal"
import { menu } from "./commands/menu.js"
import { tag } from "./commands/tag.js"
import { thidden } from "./commands/thidden.js"
import { timage } from "./commands/timage.js"
import { logtime } from "./commands/logtime.js"
import { compare_cmd } from "./utils.js"

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth-session")

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) {
            qrcode.generate(qr, { small: true })
            console.log("Scan this QR code with WhatsApp")
        }
        
        if (connection === "open") {
            console.log("Connected to WhatsApp")
            console.log("Bot is ready! Send commands in any chat.")
        }
        
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log("Connection closed, reconnecting:", shouldReconnect)
            
            if (shouldReconnect) {
                setTimeout(() => startWhatsApp(), 3000)
            }
        }
    })

    sock.ev.on("messages.upsert", async m => {     
        const msg = m.messages[0]
        
        if (!msg.message) return
        
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || ""
        
        if (!text) return
        
        console.log(`📩 Message from ${msg.key.remoteJid}: "${text}"`)
        
        if (compare_cmd(text, '-menuu')) {
            menu(msg, sock)
        }
        
        if (compare_cmd(text, '-tag')) {
            tag(msg, sock, text)
        }
        
        if (compare_cmd(text, '-thidden')) {
            await thidden(sock, msg, text)
        }

        if (compare_cmd(text, '-timage')) {
            timage(sock, msg);
        }

        if (compare_cmd(text, '-logtime')) {
            await logtime(sock, msg);
        }
    })
}

startWhatsApp()