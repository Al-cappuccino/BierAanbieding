const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
const fetch = require('node-fetch');
//const request = require('request');
const { JSDOM } = require('jsdom');



// const tabletojson = require('tabletojson');
// const jsdom = require("jsdom");
// const {JSDOM} = jsdom;


//intents
const BEER_WHERE = 'Beer_Where';
const CHEAP_BEER = 'Cheap_Beer';

//entities
const BEER_BRAND = 'Beer_Brand';

class Helper {
    constructor(conv) {
        this.conv = conv;
    }



    getCheap() {
        return new Promise((resolve, reject) => {
            let answer = "";
            try {
                fetch("https://www.biernet.nl/site/php/data/aanbiedingen.php", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                    },
                    "referrer": "https://www.biernet.nl/bier/aanbiedingen/kratten:krat-alle/winkel:albert-heijn+aldi+coop+dirk+gall-en-gall+hoogvliet+jumbo+lidl+nettorama",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": "zoeken=true&availablePositions=20,14,0,5,3,32,21,3,1,3,4,32,26,14,0,4,3,32&skip=0&kratten=krat-alle&winkel=albert-heijn+aldi+coop+dirk+gall-en-gall+hoogvliet+jumbo+lidl+nettorama+plus&screenType=large&aantal_clicks=5&current_url=/bier/aanbiedingen/kratten:krat-alle/winkel:albert-heijn+aldi+coop+dirk+gall-en-gall+hoogvliet+jumbo+lidl+nettorama&scrollToItem=true",
                    "method": "POST",
                    "mode": "cors"
                }).then(response => response.text()).then(body => {
                    try {
                        let parsedBeerList = [];
                        

                        const dom = new JSDOM(body);
                        dom.window.document.querySelectorAll("#aanbiedingen_list > li:not(.vertical_aligned_blok)").forEach((div) => {
                            let name = div.querySelector("div.informatie > div > h3 > a").innerHTML
                            let oldPrice = div.querySelector("p > span.van_prijss")
                            let newPrice = div.querySelector("p > span.voor_prijss")

                            if (oldPrice) {
                                oldPrice = oldPrice.innerHTML
                                newPrice = newPrice.innerHTML
                            } else {
                                oldPrice = div.querySelector("p > span.van_prijsss").innerHTML
                                newPrice = div.querySelector("p > span.voor_prijsss").innerHTML
                            }

                            let store = div.querySelector("div.logo_image > a > img").alt
                            let discount = div.querySelector("ul > li > i").innerHTML

                            // Remove some unwated words from the alt text tag.
                            newPrice = newPrice.replace(" ", "");
                            store = store.replace("Logo", "");
                            parsedBeerList.push({ name, oldPrice, newPrice, store, discount })
                        });
                        answer = "Momenteel is er een aanbieding voor " + parsedBeerList[0].name + " bij de " + parsedBeerList[0].store + ". Van " + parsedBeerList[0].oldPrice + " voor " + parsedBeerList[0].newPrice + ".";
                        resolve(answer)
                    } catch (e) {
                        answer = "Hmm, er is iets mis gegaan, ik kan geen aanbiedingen vinden.";
                        console.log(e)
                        reject(answer)
                    }
                })
            } catch (e) {
                answer = "Hmm, er is iets mis gegaan.";
                console.log(e)
                reject(answer)
            }

        });
    }

    getWhere(brands) {
        return new Promise((resolve, reject) => {
            let answer = "";
            request.get('url' + brands, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        // Code to check price
                    } catch (e) {
                        answer = "Hmm, er is iets mis gegaan.";
                        reject(answer)
                    }
                } else {
                    answer = "Hmm, er is iets mis gegaan.";
                    reject(answer)
                }
            });
        });
    }

    sayMessage(message) {
        console.log(message);
        this.conv.ask(message + " \n \n Kan ik nog ergens anders mee helpen?");
    }
}

const app = dialogflow().middleware(conv => {
    conv.helper = new Helper(conv);
});


//intents
app.intent(BEER_WHERE, async (conv) => {
    console.log(BEER_WHERE);
    const brands = conv.parameters[BEER_BRAND].toLowerCase();
    await conv.helper.getWhere(brands).then(message => conv.helper.sayMessage(message), error => console.log(error));
});

app.intent(CHEAP_BEER, async (conv) => {
    console.log(CHEAP_BEER);
    await conv.helper.getCheap().then(message => conv.helper.sayMessage(message), error => console.log(error));
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);