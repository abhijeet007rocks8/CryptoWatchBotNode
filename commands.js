require('dotenv').config();
const APICall = require('./utils/apiCall');
const Queries = require('./utils/queries');
const Table = require('table').table;
const Discord = require('discord.js');

const BSC_API_Key = process.env.BSC_API_Key
const ETHER_API_Key = process.env.ETHER_API_Key

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
        let price = Math.round(response.price_btc *20355.745 * 10000) / 10000;
        let tokenName = response.name.length > 7 ? response.name.substring(0, 7) + "..." : response.name;
        tableData.push([tokenName, response.symbol, response.market_cap_rank, `$${price}`]);
    }
    
    let table = Table(tableData);
    return `${msg.author} Trending Coins:\n`+"```"+table+"```";
}

const tokenVerify = async (msg, args) => {
    const smartContractAddress = args[0]
    const BSC_Verification_URL = `https://api.bscscan.com/api?module=contract&action=getabi&address=${smartContractAddress}&apikey=${BSC_API_Key}`
    const ETHER_Verification_URL = `https://api.etherscan.io/api?module=contract&action=getabi&address=${smartContractAddress}&apikey=${ETHER_API_Key}`
    const BSC_responses = await APICall.apiCallURL(BSC_Verification_URL)
    const ETHER_responses = await APICall.apiCallURL(ETHER_Verification_URL)
    
    if(BSC_responses.error || ETHER_responses.error){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    Verified = BSC_responses.status == '1' || ETHER_responses.status == '1'
    verifiedBSCToken = BSC_responses.status == '1'
    verifiedEtherToken = ETHER_responses.status == '1'

    if(Verified){
        return (`Yes, ${msg.author} this token is verified.\n`+
        "```\nSmart Contract Address: "+smartContractAddress+"\nVerified:"+Verified+"\nVerified on BSC Network: "+verifiedBSCToken+"\nVerified on Ethereum Network: "+verifiedEtherToken+"\n```")
    }else{
        return (`No, ${msg.author} this token is not verified.\n`+
        "```\nSmart Contract Address: "+smartContractAddress+"\nVerified:"+Verified+"\nVerified on BSC Network: "+verifiedBSCToken+"\nVerified on Ethereum Network: "+verifiedEtherToken+"\n```")
    }
}

const lastTransactions = async (msg, args) => {
    const network = args[0]
    const smartContractAddress = args[1]
    const query = Queries.makeTransactionsQuery(smartContractAddress, network)
    let response = await APICall.sendRequest(query)
    
    // Error Handling
    if (response === undefined) {
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    response = response.ethereum.dexTrades

    if (response === null || response.length == 0) {
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    let tableData1 = [['Type', 'Base', 'Price', 'Quote']];
    let tableData2 = [['Type', 'Base', 'Price', 'Quote']];
    
    for(let i=0; i<response.length; i++) {
        let transactionType = response[i].side
        let baseTokenAmount = (transactionType == 'SELL')? response[i].sellAmount: response[i].buyAmount;
        let otherTokenAmount = (transactionType == 'SELL')? response[i].buyAmount: response[i].sellAmount;
        let otherToken = response[i].quoteCurrency.symbol
        let baseCurrency = response[i].baseCurrency.symbol
        let TransactionAmount = response[i].tradeAmount
        baseTokenAmount = Math.round(baseTokenAmount * 1000) / 1000;
        otherTokenAmount = Math.round(otherTokenAmount * 1000) / 1000;
        TransactionAmount = Math.round(TransactionAmount * 100) / 100;
        if(i<5)
        tableData1.push([transactionType, baseTokenAmount+baseCurrency, "$"+TransactionAmount, otherTokenAmount+otherToken ])
        else
        tableData2.push([transactionType, baseTokenAmount+baseCurrency, "$"+TransactionAmount, otherTokenAmount+otherToken ])
    }
    
    let table1 = Table(tableData1);
    let table2 = Table(tableData2);
    return [table1, table2];
}

const tokenPrice = async (msg, args) => {
    const network = args[0];
    const smartContractAddress = args[1];
    const query = Queries.makeQueryLatestPrice(smartContractAddress, network);
    const response = await APICall.sendRequest(query);
    
    if(response === undefined){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    const tokenSymbol = response.ethereum.dexTrades[0].baseCurrency.symbol;
    const latestPrice = response.ethereum.dexTrades[0].quotePrice;
    return `${msg.author} Latest Price of ${tokenSymbol} in USD is:\n`+"```"+`Current Price: $${latestPrice}`+"```";
}

const tokenLiquidity = async (msg, args) => {
    const network = args[0];
    const smartContractAddress = args[1];
    let query = Queries.makeQueryTotalSupplies(smartContractAddress, network);
    let response = await APICall.sendRequest(query);

    if(response === undefined){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    const totalSupply = response.ethereum.transfers[0].amount;
    
    query = Queries.makeQueryLatestPrice(smartContractAddress, network);
    response = await APICall.sendRequest(query);

    if(response === undefined){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    const tokenSymbol = response.ethereum.dexTrades[0].baseCurrency.symbol;
    const latestPrice = response.ethereum.dexTrades[0].quotePrice;
    const market_cap = parseFloat(totalSupply) * parseFloat(latestPrice);

    return `${msg.author} Liquidity Info for ${tokenSymbol} is:\n`+"```"+`Current Price: $${latestPrice}\nMarket Cap: $${market_cap}\nTotal Supply: ${totalSupply}\nContract Address: ${smartContractAddress}`+"```";
}

const tokenInfo = async (msg, args) => {
    const network = args[0];
    const smartContractAddress = args[1];
    const query = Queries.makeQueryTokenInfo(smartContractAddress, network);
    const response = await APICall.sendRequest(query);

    if(response === undefined){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    const tokenName = response.ethereum.smartContractCalls[0].smartContract.currency.name;
    const tokenSymbol = response.ethereum.smartContractCalls[0].smartContract.currency.symbol;
    const tokenType = response.ethereum.smartContractCalls[0].smartContract.currency.tokenType;
    const tokenDecimals = response.ethereum.smartContractCalls[0].smartContract.currency.decimals;
    return `${msg.author} Token Info for ${tokenSymbol} is:\n`+"```"+`Token Name: ${tokenName}\nToken Symbol: ${tokenSymbol}\nToken Type: ${tokenType}\nToken Decimals: ${tokenDecimals}\n`+"```";
}

const searchToken = async (msg, args) => {
    const network = args[0] == 'bsc' ? 'binance-smart-chain' : 'ethereum';
    const token_contract_address = args[1];
    const URL = `https://api.coingecko.com/api/v3/coins/${network}/contract/${token_contract_address}`;
    let response = await APICall.apiCallURL(URL);
    
    if(response.error){
        if(response.error == "coin not found")
        return `Sorry ${msg.author}, I am unable to find any such coin on ${args[0]} network. Please check the token address or Network.`;
        else
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    let dataEmbed = new Discord.RichEmbed()
    .setTitle(`Token Info: ${token_contract_address}`)
    .setDescription(`Information of the token ${token_contract_address}`)
    .setColor(0x0000ff)
    .setThumbnail(response.image.large);
    
    dataEmbed.addField("Name", response.name, true);
    dataEmbed.addField("Symbol", response.symbol, true);
    dataEmbed.addField("Main Network", response.asset_platform_id, true);
    dataEmbed.addField("Contract Address", response.contract_address, false);
    dataEmbed.addField("Current Price", "$"+response.market_data.current_price.usd, true);
    dataEmbed.addField("Price Change in 7 days", response.market_data.price_change_percentage_7d_in_currency.usd+"%", true);
    if(response.links.homepage[0] != undefined)
        dataEmbed.addField("Website", response.links.homepage[0], false);
    dataEmbed.addField("Total Supply", response.market_data.total_supply, true);


    let descriptionEmbed = new Discord.RichEmbed()
    .setTitle(`Token Description: ${token_contract_address}`)
    .setDescription(`Description of the token ${token_contract_address}`)
    .setColor(0x0000ff)
    .setThumbnail(response.image.large);

    const description = response.description.en.length > 1020 ? response.description.en.substring(0, 1020) : response.description.en;
    descriptionEmbed.addField("Description", description, false);
    
    return [dataEmbed, descriptionEmbed]; 
}

const help = async (msg, bot) => {   
    let helpEmbed = new Discord.RichEmbed()
    .setTitle("CryptoWatchBot Command Help")
    .setDescription("Notice: All the commands start with '!' prefix \n If you are having any issues in the server, please contact the server admin.")
    .setColor(0x00ff00);

    helpEmbed.addField("!ping", "Command to check whether Bot is online", false);
    helpEmbed.addField("!hello", "Command to greet the Bot", false);
    helpEmbed.addField("!top <number> ", "Command to get the top {number} tokens by market cap", false);
    helpEmbed.addField("!trending", "Command to get the trending tokens", false);
    helpEmbed.addField("!tokenverify <token_symbol>", "Command to verify the Token Contract Address on BSC or ETH networks", false);
    helpEmbed.addField("!lasttransactions <network> <Token Contract Address>", "Command to get the last 10 transactions of the token", false);
    helpEmbed.addField("!price <network> <Token Contract Address>", "Command to get the current price of the token", false);
    helpEmbed.addField("!liquidity <network> <Token Contract Address>", "Command to get the liquidity info of the token", false);
    helpEmbed.addField("!tokeninfo <network> <Token Contract Address>", "Command to get the token info of the token from BlockChain network", false);
    helpEmbed.addField("!searchtoken <network> <Token Contract Address>", "Command to get the token info of the token from CoinGecko if it exists", false);
    helpEmbed.addField("!help", "Command to get the list of commands available in the bot", false);
    helpEmbed.addField("Checkout our Website to get detailed Info about a Token in one place.", "https://cryptowatch-8465a.web.app/", false);

    return helpEmbed;
}

const defaultReply = async (msg) => {
    return `Sorry ${msg.author}, I don't understand that command. Type !help to see what I can do.`;
}

module.exports = {ping, hello, topTokens, trendingTokens, tokenVerify, lastTransactions, tokenPrice, tokenLiquidity, tokenInfo, searchToken, help, defaultReply};