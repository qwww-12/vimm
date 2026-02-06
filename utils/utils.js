import { menu } from "../commands/menu.js"
import { tag } from "../commands/tag.js"
import { thidden } from "../commands/thidden.js"
import { timage } from "../commands/timage.js"
import { logtime } from "../commands/logtime.js"

export function compare_cmd(str, cmd){
    for (let i = 0; i < cmd.length; i++){
        if (str[i] == cmd[i])
            continue;
        return (false);
    }
    return (true);
}

export async function flag_status(sock, flag, myid){
    const messages = [`Vim is connected`, `Vimm is ready to process commands`];

    await sock.sendMessage(myid, {
        text: messages[flag]
    });
}

async function Mee(sock, msg, cmd, myid){
    console.log('the message is form me or no: ' + msg.key.fromMe);
    if (msg.key.fromMe === false){
        await sock.sendMessage(myid, {
            text: `          \`Vimm Bot\`\n*${msg.pushName} try ${cmd}*`
        });
        return (false);
    }
    for (let m = 0; m < 100; m++)
    {
        console.log(m);
    }
    console.log('return true');
    return (true);
}

export async function all_commands(sock, msg, text, myid){

        if (compare_cmd(text, '.menu')) {
            if (await Mee(sock, msg, text, myid) === true){
                menu(msg, sock);
            }
        }
        if (compare_cmd(text, '.tag')) {
            if (await Mee(sock, msg, text, myid) === true){
                tag(msg, sock, text);
            }
        }
        if (compare_cmd(text, '.thidden')) {
            if (await Mee(sock, msg, text, myid) === true){
                await thidden(sock, msg, text);
            }
        }
        if (compare_cmd(text, '.timage')) {
            if (await Mee(sock, msg, text, myid) === true){
                timage(sock, msg);
            }
        }
        if (compare_cmd(text, '.logtime')) {
                await logtime(sock, msg);
        }
}