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

export async function flag_connected(sock){
    const dsg = `            \`Vimm Bot\`\n*Hello ${sock.user.name} Vimm bot is ready to process commands*`;

    await sock.sendMessage(sock.user.id, {
        text: dsg
    });
}

async function Mee(sock, msg, cmd){
    if (!msg.key.fromMe){
        await sock.sendMessage(sock.user.id, {
            text: `          \`Vimm Bot\`\n*${msg.pushName} try ${cmd}*`
        });
        return (false);
    }
    return (true);
}

export async function all_commands(sock, msg, text){

        if (compare_cmd(text, '.menuu')) {
            if (Mee(sock, msg, text)){
                menu(msg, sock);
            }
        }
            
        if (compare_cmd(text, '.tag')) {
            if (Mee(sock, msg, text)){
                tag(msg, sock, text);
            }
        }
            
        if (compare_cmd(text, '.thidden')) {
            if (Mee(sock, msg, text)){
                await thidden(sock, msg, text);
            }
        }
    
        if (compare_cmd(text, '.timage')) {
            if (Mee(sock, msg, text)){
                timage(sock, msg);
            }
        }
    
        if (compare_cmd(text, '.logtime')) {
                await logtime(sock, msg);
        }
}
