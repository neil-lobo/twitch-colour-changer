const convert = require('color-convert');
const tmi = require("tmi.js");
const { channel } = require('tmi.js/lib/utils');
const db = require("./db.js");
require("dotenv").config();

const startHex = process.env.start_col;
const endHex = process.env.end_col;

const STEPS_RANGE = 13;
let dir = 1;
let step = 0;
let gradient = {
    start: [parseInt(startHex.slice(0,2), 16),parseInt(startHex.slice(2,4), 16),parseInt(startHex.slice(4,6), 16)],
    end: [parseInt(endHex.slice(0,2), 16),parseInt(endHex.slice(2,4), 16),parseInt(endHex.slice(4,6), 16)]
}

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
            client.say(process.env.ttv_username, `/color #${process.env.initial_col}`)
            client.disconnect();
            break;
    }

});

function changeColour() {
    let val = step/(STEPS_RANGE-1);
    let colour = [0,0,0]
    for(let i of [0,1,2]) {
        colour[i] = gradient.start[i] + val * (gradient.end[i] - gradient.start[i])
    }
    step+= dir;
    if (step >= STEPS_RANGE-1 || step <= 0) {
        dir *= -1;
    }

    let colourHex = "";
    for(let i of [0,1,2]) {
        colourHex += Math.round(colour[i]).toString(16)
    }
    console.log(`#${colourHex}`)

    client.say(process.env.ttv_username, `/color #${colourHex}`)
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