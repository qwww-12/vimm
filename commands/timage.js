function ask(question) {
    return new Promise(resolve => {
        process.stdout.write(question)
        process.stdin.once('data', data => resolve(data.toString().trim()))
    })
}

export async function timage(sock, msg){
    try {

        if (!sock || !sock.user){
            console.log('WhatsApp not connected yet. Please wait...');
            return ;
        }

        const groupsData = await sock.groupFetchAllParticipating();
        const groups = Object.values(groupsData).map(el => ({
            id: el.id,
            subject: el.subject
        }))

        if (groups.length === 0){
            console.log('No groups found');
            return ;
        }

        groups.forEach((el, i) => {
            console.log(`${i + 1}. ${el.subject}`);
        });

        const choice = await ask('Enter the number of the group to hidetag: ');
        const groupIndex = parseInt(choice) - 1;

        if (groupIndex < 0 || groupIndex >= groups.length){
            console.log('Index not valid');
            return ;
        }

        const groupId = groups[groupIndex].id;
        const groupMetadata = await sock.groupMetadata(groupId);
        const participants = groupMetadata.participants.map(p => p.id);

        await sock.sendMessage(groupId, {
            image: { url: './image.jpg' },
            mentions: participants
        });
    } catch(err){
        console.log('Error in timage function:', err);
    }
}
