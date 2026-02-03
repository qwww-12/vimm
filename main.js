import readline from 'readline'
import makeWASocket from '@whiskeysockets/baileys'

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
    let pn;
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
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const number = String(pn);
        const code = await sock.requestPairingCode(number)
        console.log(code)
    }
}

main();