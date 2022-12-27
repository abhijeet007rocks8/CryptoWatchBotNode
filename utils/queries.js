function makeQueryTokenInfo(token, network) {
    return `
    {
      ethereum(network: ${network}) {
        smartContractCalls(
          smartContractMethod: {is: "Contract Creation"}
          smartContractAddress: {is: "${token}"}
        ) {
          block {
            timestamp {
              time
            }
          }
          smartContract {
            contractType
            currency {
              name
              symbol
              tokenType
              decimals
            }
          }
          smartContractMethod {
            name
          }
        }
      }
    }`
  }
  
  function makeQueryTokensInfo(network, tokens) {
    return `
    {
      ethereum(network: ${network}) {
        smartContractCalls(
          smartContractMethod: {is: "Contract Creation"}
          smartContractAddress: {in: [${tokens.map(t => '\"'+t+'\"').join(',')}]}
        ) {
          block {
            timestamp {
              time
            }
          }
          smartContract {
            contractType
            currency {
              name
              symbol
              tokenType
            }
            address {
              address
            }
          }
          smartContractMethod {
            name
          }
        }
      }
    }`
  }
  
  function makeQueryTotalSupplies(token, network){
      return `
      {
          ethereum(network: ${network}) {
          transfers(
          currency: {is: "${token}"}
          sender: {is: "0x0000000000000000000000000000000000000000"}
          ) {
          amount
          }
          }
      }
      `
  }
  
  function makeQueryBurnedTokens(network, token) {
      return `
      {
          ethereum(network: ${network}) {
          transfers(
          currency: {is: "${token}"}
          receiver: {
          in: ["0x0000000000000000000000000000000000000000",
          "0x000000000000000000000000000000000000dead",
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002"]
          }
          ) {
          amount
          }
          }
      }
      `
  }
  
  function makeQueryTokenPairs(network, token) {
    return `
      {
        ethereum(network: ${network}) {
          dexTrades(
            baseCurrency: {is: "${token}"}
            options: {desc: "trades", limit: 10}
          ) {
            poolToken: smartContract {
              address {
                address
              }
            }
            exchange {
              fullName
            }
            pair: quoteCurrency {
              symbol
              address
            }
            trades: count
            quotePrice
          }
        }
      }
    `
  }
  
  function makeQueryBalances(network, address) {
    return `
      {
        ethereum(network: ${network}) {
          address(address: {is: "${address}"}) {
            balances {
              currency {
                symbol
              }
              value
            }
          }
        }
      }
    `
  }
  
  function makeQueryLatestPrice(address, network = 'bsc') {
    // busd or usdc
    const quoteCurrency = network === 'bsc' ? "0xe9e7cea3dedca5984780bafc599bd69add087d56" : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    return `
    {
      ethereum(network: ${network}) {
        dexTrades(
          options: {desc: ["block.height", "tradeIndex"], limit: 1}
          exchangeName: {in: ["Pancake", "Pancake v2"]}
          baseCurrency: {is: "${address}"}
          quoteCurrency: {is: "${quoteCurrency}"}
        ) {
          transaction {
            hash
          }
          tradeIndex
          smartContract {
            address {
              address
            }
            contractType
            currency {
              name
            }
          }
          tradeIndex
          block {
            height
          }
          baseCurrency {
            symbol
            address
          }
          quoteCurrency {
            symbol
            address
          }
          quotePrice
        }
      }
    }  
    `
  }
  
  function makeQueryLatestPriceByETH(address, network = 'bsc') {
    // wbnb or weth
    const quoteCurrency = network === 'bsc' ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    return `
    {
      ethereum(network: ${network}) {
        dexTrades(
          options: {desc: ["block.height", "tradeIndex"], limit: 1}
          exchangeName: {in: ["Pancake", "Pancake v2"]}
          baseCurrency: {is: "${address}"}
          quoteCurrency: {is: "${quoteCurrency}"}
        ) {
          transaction {
            hash
          }
          tradeIndex
          smartContract {
            address {
              address
            }
            contractType
            currency {
              name
            }
          }
          tradeIndex
          block {
            height
          }
          baseCurrency {
            symbol
            address
          }
          quoteCurrency {
            symbol
            address
          }
          quotePrice
        }
      }
    }  
    `
  }
  
  function makeTransactionsQuery(token, network='bsc'){
    let quote = network=="bsc" ? "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" : "0xdac17f958d2ee523a2206206994597c13d831ec7"
    return `
      {
        ethereum(network: ${network}) {
          dexTrades(
            options: {desc: "block.timestamp.time", limit: 10}
            baseCurrency: {is: "${token}"}
            quoteCurrency: {is: "${quote}"}
            tradeAmountUsd: {gt: 0}
          ) {
            block {
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S GMT")
              }
            }
            smartContract {
              address {
                address
              }
              currency {
                name
                symbol
              }
            }
            sellCurrency {
              name
              symbol
            }
            buyCurrency {
              name
              symbol
            }
            transaction {
              hash
              gasPrice
              gasValue
            }
            baseCurrency{
              symbol
            }
            quoteCurrency{
              name
              symbol
            }
            tradeAmount(in: USD)
            side
            buyAmount
            sellAmount
            quoteAmount
            quotePrice
            exchange{
              name
            }
          }
        }
      }`
  }
  
  function makePriceHistoryQuery(token, network, startDate, interval) {
    let quote
    if(network=='bsc') {
      quote="0xe9e7cea3dedca5984780bafc599bd69add087d56" // busd
    } else {
      quote="0xdac17f958d2ee523a2206206994597c13d831ec7" // usdt
    }
  
    return(`
    {
      ethereum(network: ${network}) {
        dexTrades(
          options: {asc: "timeInterval.minute"}
          date: {since: "${startDate}"}
          baseCurrency: {is: "${token}"}
          quoteCurrency: {is: "${quote}"}
        ) {
          timeInterval {
            minute(count: ${interval})
          }
          baseCurrency {
            symbol
            address
          }
          baseAmount
          quoteCurrency {
            symbol
            address
          }
          volume: quoteAmount
          trades: count
          current: quotePrice
          open: minimum(of: block, get: quote_price)
          high: quotePrice(calculate: maximum)
          low: quotePrice(calculate: minimum)
          close: maximum(of: block, get: quote_price)
        }
      }
    }
    `)
  }
  
  module.exports = {
      makeQueryTokenInfo,
      makeQueryTokensInfo,
  
      makeQueryBurnedTokens,
      makeQueryTotalSupplies,
  
      makeQueryTokenPairs,
      makeQueryBalances,
      
      makeQueryLatestPrice,
      makeQueryLatestPriceByETH,
  
      makeTransactionsQuery,
  
      makePriceHistoryQuery,
  }