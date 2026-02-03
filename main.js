import readline from 'readline'

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
            const pn = await getNumber();
            console.log(`Your number is ${pn}`)
            break;
        } catch (err) {
            console.log(err);
        }
    }
}

main();