function sendRequest(query) {
    return new Promise((resolve, reject) => {
      fetch("https://graphql.bitquery.io/", {
        method: "POST",
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-API-Key': 'BQYQ63mocvEo90o2ghwtjB4hwoyGPtYh'
        },
        body: JSON.stringify({
            query: query,
            variables: "{}"
        }),
      })
      .then(response => response.json())
      .then(json => {
        resolve(json.data)
      })
      .catch(() => {
        reject()
      })
    })
}

function apiCallURL(URL){
    return new Promise((resolve, reject) => {
        fetch(URL)
        .then(response => response.json())
        .then(json => {
            resolve(json)
        })
        .catch(() => {
            reject()
        })
    })
}

// const axios = require('axios');

// create sendRequest function using Axios instead of fetch
// function sendRequest(query) {
//     return new Promise((resolve, reject) => {
//         axios.post("https://graphql.bitquery.io/", {
//             query: query,
//             variables: "{}"
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Access-Control-Allow-Origin': '*',
//                 'X-API-Key': 'BQYQ63mocvEo90o2ghwtjB4hwoyGPtYh'
//             }
//         })
//         .then(response => response.json())
//         .then(response => {
//             resolve(response.data.data)
//         })
//         .catch(() => {
//             reject()
//         })
//     })
// }

// create apiCallURL function using Axios instead of fetch
// function apiCallURL(URL){
//     return new Promise((resolve, reject) => {
//         axios.get(URL)
//         .then(response => {
//             resolve(response.data)
//         })
//         .catch(() => {
//             reject()
//         })
//     })


module.exports = {
    sendRequest,
    apiCallURL
}