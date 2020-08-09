const express = require(`express`);
const appExpress = express();
const server = require(`http`).createServer(appExpress);
const io = require(`socket.io`)(server, {});

// DEFINE VARIABLE
let array_member = [];

// SERVER
server.listen(3000, () => {
    console.log(`Open port: 3000`);
});
io.on(`connection`, async socket => {
    socket.on(`join-room`, (name) => {
        const member = {'id': socket.id,'name': name, character: ''};
        array_member.push(member);
        io.emit('member-join', member);
    });
    socket.on(`disconnect`, (name) => {
        const member_id = socket.id;
        const memberLeave = array_member.filter(item => {
            return item.id === member_id;
        });
        if ( memberLeave[0] ) {
            array_member.splice(memberLeave[0].id, 1);
            console.log(array_member);
        }
        io.emit('member-leave', member_id);
    });
    socket.on(`load-server`, () => {
        io.emit('load-server-player', array_member);
    })
    socket.on(`start-game`, (data) => {
        let data_character = [];
        data.forEach(element => {
            for (let index = 1; index <= element.count; index++) {
                data_character.push(element.character);
            }
        });
        data_character = random_array(data_character);
        array_member.forEach((element, index) => {
            element.character = data_character[index];
            io.to(element.id).emit('start-game', data_character[index]);
        });
        io.emit('start-game-player', array_member);
    });
});

function random_array(array) {
    const tempArr = [];
    while (array.length > 0) {
        const indexRand =  Math.floor(Math.random()*array.length);
        const itemRand = array[indexRand];
        tempArr.push(itemRand);
        array.splice(indexRand, 1);
    }
    return tempArr;
}


// HTTP
appExpress.use(`/tmp`, express.static(`tmp`));
appExpress.get(`/`, (request, response) => {
    response.sendFile(`${__dirname}/client.html`);
});
appExpress.get(`/sv`, (request, response) => {
    response.sendFile(`${__dirname}/server.html`);
});
