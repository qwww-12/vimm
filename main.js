import * as baileys from "@whiskeysockets/baileys"
import P from "pino"
import qrcode from "qrcode-terminal"
import { all_commands, compare_cmd, flag_status } from "./utils/utils.js"

// const _log = console.log
// console.log = (...args) => {
//     const msg = args.join(' ')
//     if (!msg.includes('Session') && !msg.includes('Closing') && !msg.includes('Ratchet')) {
//         _log(...args)
//     }
// }
let myid;
let one = true;

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth-session")
    
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    })
    
    let get_id = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    myid = get_id;
    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) {
            qrcode.generate(qr, { small: true })
            console.log("Scan this QR code with WhatsApp")
        }
        
        if (connection === "open") {
            await flag_status(sock, 0, myid);
            console.log("Connected to WhatsApp");
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
        if (!text) 
            return ;
        if (one === true){
            await flag_status(sock, 1, myid);
            one = false;
        }
        all_commands(sock, msg, text, myid);
    })
}

startWhatsApp()