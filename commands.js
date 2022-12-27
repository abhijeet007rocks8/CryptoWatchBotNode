const Discord = require('discord.js');

const ping = async (msg) => {
    return `Pong! ${msg.author}`;
};

const hello = async (msg) => {
    return `Hello! ${msg.author} I am a bot that can help you with your token queries. Type !help to see what I can do.`;
};

const topTokens = async (msg, args) => {

}

const trendingTokens = async (msg) => {

}

const tokenVerify = async (msg, args) => {

}

const lastTransactions = async (msg, args) => {

}

const tokenPrice = async (msg, args) => {

}

const tokenLiquidity = async (msg, args) => {

}

const tokenInfo = async (msg, args) => {

}

const searchToken = async (msg, args) => {

}

const help = async (msg, bot) => {   
    // return all the commands and their working in embed
    
}

const defaultReply = async (msg) => {
    return `Sorry ${msg.author}, I don't understand that command. Type !help to see what I can do.`;
}

module.exports = {ping, hello, topTokens, trendingTokens, tokenVerify, lastTransactions, tokenPrice, tokenLiquidity, tokenInfo, searchToken, help, defaultReply};