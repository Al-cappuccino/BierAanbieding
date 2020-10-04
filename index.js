const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google');
const fetch = require('node-fetch');


// const tabletojson = require('tabletojson');
// const jsdom = require("jsdom");
// const {JSDOM} = jsdom;


//intents
const BEER_WHERE = 'Beer_Where';

//entities
const BEER_BRAND = 'Beer_Brand';

class Helper {
    constructor(conv) {
        this.conv = conv;
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

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);