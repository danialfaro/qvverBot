const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "/";

client.on("message", (message) => {

    // If the message is another Bot, do nothing
    if(message.author.bot) return;
     // If the message don't start with the Bot Command prefix, do nothing
    if(!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    // Command to check the ping with the bot
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }

})

client.login(config.BOT_TOKEN);