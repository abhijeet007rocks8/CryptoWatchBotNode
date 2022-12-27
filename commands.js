require('dotenv').config();
const BSC_API_Key = process.env.BSC_API_Key
const ETHER_API_Key = process.env.ETHER_API_Key
const APICall = require('./utils/apiCall');
const Queries = require('./utils/queries');
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

}

const tokenPrice = async (msg, args) => {
    const network = args[0];
    const smartContractAddress = args[1];
    const query = Queries.makeQueryLatestPrice(smartContractAddress, network);
    const response = await APICall.sendRequest(query);
    
    if(response.error){
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

    if(response.error){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    const totalSupply = response.ethereum.transfers[0].amount;
    
    query = Queries.makeQueryLatestPrice(smartContractAddress, network);

    if(response.error){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    response = await APICall.sendRequest(query);
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

    if(response.error){
        return `Sorry ${msg.author}, I am unable to fetch the data. Please try again later.`;
    }

    const tokenName = response.ethereum.smartContractCalls[0].smartContract.currency.name;
    const tokenSymbol = response.ethereum.smartContractCalls[0].smartContract.currency.symbol;
    const tokenType = response.ethereum.smartContractCalls[0].smartContract.currency.tokenType;
    const tokenDecimals = response.ethereum.smartContractCalls[0].smartContract.currency.decimals;
    return `${msg.author} Token Info for ${tokenSymbol} is:\n`+"```"+`Token Name: ${tokenName}\nToken Symbol: ${tokenSymbol}\nToken Type: ${tokenType}\nToken Decimals: ${tokenDecimals}\n`+"```";
}

const searchToken = async (msg, args) => {

}

const help = async (msg, bot) => {   
    
}

const defaultReply = async (msg) => {
    return `Sorry ${msg.author}, I don't understand that command. Type !help to see what I can do.`;
}

module.exports = {ping, hello, topTokens, trendingTokens, tokenVerify, lastTransactions, tokenPrice, tokenLiquidity, tokenInfo, searchToken, help, defaultReply};