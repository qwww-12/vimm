import readline from 'readline'
import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'

let pn;

function PnIsCorrect(pn){
    for (let i = 0; i < pn.length; i++){
        if (pn[i] >= '0' && pn[i] <= '9')
            continue;
        return false;
    }
    return true;
}

function getNumber(){
    return new Promise((resolve, reject) => {
        let pn;
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter your phone number without (+): ', pn => {
            if (PnIsCorrect(pn) == true) {
                rl.close();
                resolve(Number(pn));
            }
            else {
                rl.close();
                reject('Numbet is not valid');
            }
        })
    });
}

async function main(){
    while (true){
        try {
            pn = await getNumber();
            console.log(`Your number is ${pn}`)
            break;
        } catch (err) {
            console.log(err);
        }
    }

    const { state, saveCreds } =
        await useMultiFileAuthState('./sessions/auth-session');

const sock = makeWASocket({
    auth: state,
  printQRInTerminal: true,
  browser: ["Ubuntu", "Chrome", "20.0.04"],
  connectTimeoutMs: 60000,
  keepAliveIntervalMs: 25000,
  defaultQueryTimeoutMs: 60000,
  emitOwnEvents: true,
  retryRequestDelayMs: 250
});

sock.ev.on('connection.update', async (update) => {
    const { connection } = update

    if (connection === 'open') {
        console.log('Connected!')
    }

    if (connection === 'connecting') {
        console.log('Connecting...')
    }
})

setTimeout(async () => {
    const code = await sock.requestPairingCode(pn)
    console.log('PAIRING CODE:', code)
}, 3000)

}

main();