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
        io.to(socket.id).emit('member-join', member);
        io.emit('member-join-server', member);
    });
    socket.on(`disconnect`, (name) => {
        const member_id = socket.id;
        const indexLeave = array_member.findIndex((item) => (item.id === member_id));
        const inArray = array_member.some((item) => (item.id === member_id));

        (inArray) && array_member.splice(indexLeave, 1);
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
            io.to(element.id).emit('flip-card', data_character[index]);
        });
        io.emit('start-game-player', array_member);
    });
    socket.on(`restart-game`, (data) => {   
        array_member.forEach((element, index) => {
            io.to(element.id).emit('flip-card', `START`);
        });
        io.emit('restart-game-player');
    });
    socket.on(`kill-member`, (id) => {
        io.to(id).emit('flip-card', `DIE`);
        io.emit('kill-member', id);
    });
    socket.on(`resurrection-member`, (id) => {
        const res_mem = array_member.filter((item) => (item.id === id));
        const character = res_mem[0].character;
        io.to(id).emit('flip-card', character);
        io.emit('resurrection-member', res_mem[0]);
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
