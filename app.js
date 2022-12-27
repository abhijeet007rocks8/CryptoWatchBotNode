require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const prefix = "!";

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return; 

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(args);
    console.log(command);

    

    // if (msg.content === 'ping') {
    //     msg.reply('pong');
    //     msg.channel.send('pong');

    // } else if (msg.content.startsWith('!kick')) {
    //     if (msg.mentions.users.size) {
    //     const taggedUser = msg.mentions.users.first();
    //     msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
    //     } else {
    //     msg.reply('Please tag a valid user!');
    //     }
    // }
});