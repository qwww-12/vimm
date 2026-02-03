import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import P from 'pino'
import readline from 'readline'

// =======================
// Helper: سؤال فالترمينال
// =======================
async function ask(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise(resolve => rl.question(prompt, ans => {
        rl.close()
        resolve(ans)
    }))
}

// =======================
// Main Function
// =======================
async function connectToWhatsApp() {
    // =======================
    // 1️⃣ Auth State (MultiFileAuth)
    // =======================
    const { state, saveCreds } = await useMultiFileAuthState('./session')

    // =======================
    // 2️⃣ Fetch latest WA version
    // =======================
    const { version } = await fetchLatestBaileysVersion()
    console.log(`Using WA version: ${version.join('.')}`)

    // =======================
    // 3️⃣ Create Socket
    // =======================
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false, // false => نتحكم بالpairing code
        browser: ['MyBot', 'Chrome', '1.0.0'],
        version
    })

    sock.ev.on('creds.update', saveCreds)

    // =======================
    // 4️⃣ Connection Updates
    // =======================
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        if (connection === 'connecting') console.log('🔄 Connecting...')
        if (connection === 'open') console.log('✅ Connected!')
        if (qr) {
            console.log('📌 Scan this QR code in WhatsApp Web or use pairing code!')
        }
        if (connection === 'close') {
            console.log('❌ Connection closed:', lastDisconnect?.error || 'Unknown')
            console.log('🔁 Reconnecting...')
            connectToWhatsApp()
        }
    })

    // =======================
    // 5️⃣ Pairing Code (Optional)
    // =======================
    if (!sock.authState.creds.registered) {
        try {
            const phone = await ask('Enter your phone number (with country code, e.g., 2126XXXXXXX): ')
            const code = await sock.requestPairingCode(phone.trim())
            console.log(`🎁 Pairing Code: ${code}`)
        } catch (err) {
            console.error('Failed to get pairing code:', err)
        }
    }

    // =======================
    // 6️⃣ Listen to incoming messages
    // =======================
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const sender = msg.key.remoteJid
        const pushname = msg.pushName || 'Unknown'
        console.log(`📩 Message from ${pushname} (${sender}): ${body}`)
    })
}

// =======================
// Run
// =======================
connectToWhatsApp()
