const express = require(`express`);
const { Console } = require("console");
const appExpress = express();
const server = require(`http`).createServer(appExpress);
const io = require(`socket.io`)(server, {});
const port = process.env.PORT || 3000;

// DEFINE VARIABLE
let array_player = [];
let array_wolf_group = [`WOLF`, `BIG-WOLF`, `WHITE-WOLF`, `BLACK-WOLF`, `PARSE-WOLF`]
let nameOfServer = "Lawer";
let unknowPlayerName = "player" // name + random number 1000 9999;

// SERVER
server.listen(port, () => {
    console.log(`Open port: 3000`);
});
io.on(`connection`, async socket => {
    socket.on(`join-room`, (name) => {
        const random = Math.floor(Math.random() * 9999) + 1000;
        const nameUnknow = `${unknowPlayerName} - ${random}`;
        const player = {'id': socket.id,'name': (name) ? name : nameUnknow, character: ''};
        array_player.push(player);
        io.to(socket.id).emit('player-join', player);
        io.emit('player-join-server', player);
    });
    socket.on(`disconnect`, (name) => {
        const player_id = socket.id;
        const indexLeave = array_player.findIndex((item) => (item.id === player_id));
        const inArray = array_player.some((item) => (item.id === player_id));

        (inArray) && array_player.splice(indexLeave, 1);
        io.emit('player-leave', player_id);
    });
    socket.on(`load-server`, () => {
        io.emit('load-server-player', array_player);
    })
    socket.on(`start-game`, (data) => {
        let data_character = [];
        data.forEach(element => {
            for (let index = 1; index <= element.count; index++) {
                data_character.push(element.character);
            }
        });
        data_character = random_array(data_character);
        array_player.forEach((element, index) => {
            element.character = data_character[index];
            io.to(element.id).emit('flip-card', data_character[index]);
        });
        io.emit('start-game-player', array_player);
    });
    socket.on(`restart-game`, (data) => {   
        array_player.forEach((element, index) => {
            io.to(element.id).emit('flip-card', `START`);
        });
        io.emit('restart-game-player');
    });
    socket.on(`kill-player`, (id) => {
        io.to(id).emit('flip-card', `DIE`);
        io.emit('kill-player', id);
    });
    socket.on(`resurrection-player`, (id) => {
        const res_mem = array_player.filter((item) => (item.id === id));
        const character = res_mem[0].character;
        io.to(id).emit('flip-card', character);
        io.emit('resurrection-player', res_mem[0]);
    });
    socket.on(`chat-from-server-to-server`, (data) => {
        const {
            target,
            content
        } = data;
        const name = nameOfServer;
        const isWolf = array_wolf_group.some((item) => item == target);
        const array_request_player = array_player.filter((item) => {
            if ( isWolf ) {
                return array_wolf_group.indexOf(item.character) >= 0;
            } else {
                return item.character === target;
            }
        });

        array_request_player.forEach((element) => {
            const id = element.id;
            io.to(id).emit(`chat-from-server-to-client`, {name, content});
        });
    });
    socket.on(`chat-from-client-to-server`, (content) => {
        let { character, name } = array_player.filter((item) => item.id === socket.id)[0];
        const isWolf = array_wolf_group.some((item) => item == character);
        const targetForServer = ( isWolf ) ? `WOLF` : character;
        const array_request_player = array_player.filter((item) => {
            if ( isWolf ) {
                return array_wolf_group.indexOf(item.character) >= 0;
            } else {
                return item.character === character;
            }
        });
        array_request_player.forEach((element) => {
            const id = element.id;
            io.to(id).emit(`chat-from-server-to-client`, {name, content});
        });
        io.emit(`chat-request-from-client-to-server`,{targetForServer, name, content});
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
