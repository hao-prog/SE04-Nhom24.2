import request from "request";

require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let setUpMessengerPlatform = (PAGE_ACCESS_TOKEN) => {
    let data = {
        "get_started": {
            "payload": "GET_STARTED"
        },
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Hi1",
                        "payload": "loichaomot"
                    },
                    {
                        "type": "postback",
                        "title": "Hi2",
                        "payload": "loichaohai"
                    },
                    {
                        "type": "postback",
                        "title": "Hi3",
                        "payload": "loichaoba"
                    }
                ]
            }
        ],

        "whitelisted_domains": [
            "https://botchat2000.herokuapp.com/"
        ]
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v7.0/me/messenger_profile",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": data
    }, (err, res, body) => {
        if (!err) {
            return res.status(200).json({
                message: "Done"
            })
        } else {
            return res.status(500).json({
                "message": "Error from the node server"
            })
        }
    });
}

module.exports = {
    setUpMessengerPlatform: setUpMessengerPlatform
}