const tmi = require("tmi.js");

class Client {
    constructor() {
        this.client = new tmi.Client({
            options: {
                debug: false
            },
            identity: {
                username: process.env.ttv_username,
                password: process.env.ttv_password
            },
            channels: [process.env.ttv_username]
        })
    }

    connect() {
        return this.connect();
    }

    listen() {
        this.client.on("message", (channel, state, message, self) => {
            if (state.username != process.env.ttv_username) return;
            changeColour();
            if (!message.startsWith("!")) return;
        
            let args = message.split(" ");
            let command = args.shift();
            command = command.substring("!");
        
            switch(command) {
                case "join":
                break;
                case "setbase":
                break;
            }
        
        });
    }
}