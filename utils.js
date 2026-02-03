export function compare_cmd(str, cmd){
    for (let i = 0; i < cmd.length; i++){
        if (str[i] == cmd[i])
            continue;
        return (false);
    }
    return (true);
}