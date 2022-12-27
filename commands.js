const Discord = require('discord.js');
const APICall = require('./utils/apiCall');
const Table = require('table').table;

const ping = async (msg) => {
    return `Pong! ${msg.author}`;
};

const hello = async (msg) => {
    return `Hello! ${msg.author} I am a bot that can help you with your token queries. Type !help to see what I can do.`;
};

const topTokens = async (msg, args) => {
    const limit = args[0];
    const URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
    const responses = await APICall.apiCallURL(URL);
    
    // Error Handling
    if (responses.error) {
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }
    
    let tableData = [['Rank', 'Name', 'Symbol', 'Price']];
    for(let i=0; i<responses.length; i++) {
        let price = Math.round(responses[i].current_price * 10000) / 10000;
        tableData.push([responses[i].market_cap_rank, responses[i].name, responses[i].symbol, `$${price}`]);
    }
    
    let table = Table(tableData);
    return `${msg.author} Trending ${limit} Coins:\n`+"```"+table+"```";
}

const trendingTokens = async (msg) => {
    const URL = `https://api.coingecko.com/api/v3/search/trending`;
    let responses = await APICall.apiCallURL(URL);
    responses = responses.coins;

    // Error Handling
    if (responses.error) {
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }
    
    let tableData = [['Rank', 'Name', 'Symbol', 'Price']];
    for(let i=0; i<responses.length; i++) {
        const response = responses[i].item;
        // round price to 4 decimal places
        let price = Math.round(response.price_btc *20355.745 * 10000) / 10000;
        let tokenName = response.name.length > 7 ? response.name.substring(0, 7) + "..." : response.name;
        tableData.push([tokenName, response.symbol, response.market_cap_rank, `$${price}`]);
    }
    
    let table = Table(tableData);
    return `${msg.author} Trending Coins:\n`+"```"+table+"```";
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
    
}

const defaultReply = async (msg) => {
    return `Sorry ${msg.author}, I don't understand that command. Type !help to see what I can do.`;
}

module.exports = {ping, hello, topTokens, trendingTokens, tokenVerify, lastTransactions, tokenPrice, tokenLiquidity, tokenInfo, searchToken, help, defaultReply};