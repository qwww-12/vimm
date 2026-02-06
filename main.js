import * as baileys from "@whiskeysockets/baileys"
import P from "pino"
import qrcode from "qrcode-terminal"
import { all_commands, compare_cmd, flag_connected } from "./utils/utils.js"

// const _log = console.log
// console.log = (...args) => {
//     const msg = args.join(' ')
//     if (!msg.includes('Session') && !msg.includes('Closing') && !msg.includes('Ratchet')) {
//         _log(...args)
//     }
// }

let one = true;

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
            await sock.sendMessage(sock.user.id, {
                text: `        \`Vimm Bot\`\n *Hello ${sock.user.name} Vimm bot is connected*`
            });
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
        
                // if (compare_cmd(text, '.timage')) {
                //     if (Mee(sock, msg, text)){
                //         timage(sock, msg);
                //     }
                // }
        if (one === true){
            flag_connected(sock);
            console.log('Vimm is ready');
            one = false;
        }
        // console.log(`message ${text}`);
        all_commands(sock, msg, text);
    })
}

startWhatsApp()