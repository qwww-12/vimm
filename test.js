import * as baileys from "@whiskeysockets/baileys"
import P from "pino"
import qrcode from "qrcode-terminal"
import { menu } from "./commands/menu.js"
import { tag } from "./commands/tag.js"
import { hidetag } from "./commands/hidetag.js"
import { allgroup } from "./commands/all.js"

const { makeWASocket, useMultiFileAuthState } = baileys

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth-session")

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", update => {
        const { connection, qr } = update
        if (qr) {
            qrcode.generate(qr, { small: true })
            console.log("✅ Scan this QR code with WhatsApp")
        }
        if (connection === "open") console.log("✅ Connected to WhatsApp")
        if (connection === "close") console.log("❌ Connection closed")
    })

    sock.ev.on("messages.upsert", async m => {
        const msg = m.messages[0]
        if (!msg.message) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        console.log(`[MSG] ${msg.key.remoteJid}: ${text}`)

        if (text === ".menu") {
            menu(msg, sock);
        }
        if (text === ".tag") {
            tag(msg, sock);
        }
        if (text === ".hidetag") {
            hidetag(sock)
        }
        if (text === ".allgroup"){
            allgroup(sock, msg);
        }
    })
}

startWhatsApp()
