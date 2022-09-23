const convert = require('color-convert');
const tmi = require("tmi.js");
const { channel } = require('tmi.js/lib/utils');
const db = require("./db.js");
require("dotenv").config();

let initial_col = process.env.initial_col;
let offsetMax = 8;
let offsetIncr = 2;
let offset = 0;

const client = new tmi.Client({
    options: {
        debug: false
    },
    identity: {
        username: process.env.ttv_username,
        password: process.env.ttv_password
    },
    channels: [process.env.ttv_username]
})

client.connect().then(() => joinChannels())

client.on("message", (channel, state, message, self) => {
    if (state.username != process.env.ttv_username) return;
    changeColour();
    if (!message.startsWith("!")) return;

    let args = message.split(" ");
    let command = args.shift();
    command = command.substr(1);

    switch(command) {
        case "join":
            client.say(process.env.ttv_username, `Joined #${args[0]}`)
        break;
        case "setbase":
            client.say(process.env.ttv_username, `Set base to #${args[0]}`)
            break;
        case "stop":
            client.say(process.env.ttv_username, `Stopping`)
            client.say(process.env.ttv_username, `/color #${initial_col}`)
            client.disconnect();
            break;
    }

});

let changingColour = false;
function changeColour() {
    if (changingColour) return;

    changingColour = true;
    /*setTimeout(() => {
        client.say(`#${process.env.ttv_username}`, `/color #${calcNewColour()}`)
        changingColour = false;
    }, 0)
    */
    client.say(`#${process.env.ttv_username}`, `/color #${calcNewColour()}`)
    changingColour = false;
}

function calcNewColour() {
    let colour = convert.hex.hsl(initial_col);

    if (Math.abs(offsetIncr + offset) > offsetMax) {
        offsetIncr = -offsetIncr;
    }

    offset += offsetIncr;
    colour[2] += offset;

    inlineLog(`${offsetIncr} | ${offset} | ${offsetMax}`);

    return convert.hsl.hex(colour[0], colour[1], colour[2])

}

function inlineLog(str) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(str);
}

async function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), ms)
    })
}

async function joinChannels() {
    let res = await db.all("SELECT * FROM CHANNELS");

    channelsToJoin = {}; // added if need to check for unsuccessful channel joins
    res.forEach(row => {
        channelsToJoin[row["CHANNEL"]] = true;
    })

    for(let channel of res) {
        await timeout(1000)
        console.log(`Joining: #${channel["CHANNEL"]}`)
        client.join(`#${channel["CHANNEL"]}`)
            .then(() => { channelsToJoin[channel["CHANNEL"]] = false})
            .catch((err) => console.error(err))
    }
}

// async function joinChannel(channel) {
//     let promise = new Promise((resolve, reject) => {
//         client.join
//     })
// }