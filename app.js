require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const prefix = "!";
const commands = require('./commands');

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return; 

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // console.log(args);
    // console.log(command);
  
    switch (command) {
        case 'ping':
          response = await commands.ping(msg);
          break;
        case 'hello':
          response = await commands.hello(msg);
          break;
        case 'top':
          response = await commands.topTokens(msg, args);
          break;
        case 'trending':
          response = await commands.trendingTokens(msg);
          break;
        case 'tokenverify':
          response = await commands.tokenVerify(msg, args);
          break;
        case 'lasttransactions':
          response = await commands.lastTransactions(msg, args);
          if(Array.isArray(response)){
            msg.channel.send(`${msg.author} Last 10 Transactions of ${args[1]}:\n`+"```"+response[0]+"```");
            msg.channel.send("```"+response[1]+"```");
          }
          break;
        case 'price':
          response = await commands.tokenPrice(msg, args);
          break;
        case 'liquidity':
          response = await commands.tokenLiquidity(msg, args);
          break;
        case 'tokeninfo':
          response = await commands.tokenInfo(msg, args);
          break;
        case 'search':
          response = await commands.searchToken(msg, args);
          if(Array.isArray(response)){
            msg.channel.send(`${msg.author} Token Search Result for ${args[1]} on network ${args[0]}:`);
            msg.channel.send(response[0]);
            msg.channel.send(response[1]);
          }
          break;
        case 'help':
          response = await commands.help(msg, bot);
          break;
        default:
          response = await commands.defaultReply(msg);
      }

      if(!Array.isArray(response)){
        msg.channel.send(response);
      }
});