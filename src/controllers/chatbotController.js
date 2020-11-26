require("dotenv").config();
import request from "request";

let getHomepage = (req, res) => {
    return res.render("homepage.ejs");
}

let getWebhook = (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

let postWebhook = (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {


            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

var curQ = 1;

var askPhoneNumQs = {
  1: 'Số điện thoại của Anh/Chị là gì ạ?',
  2: 'Tôi có thể liên lạc với Anh/Chị qua số điện thoại là gì nhỉ?',
  3: 'Vui lòng cho biết Số điện thoại của Anh/Chị?',
}

var askOtherOrgQs = {
  1: 'Vậy đơn vị/bộ phận mà Anh/Chị đang đại diện là gì?',
  2: 'Anh/Chị đang đại diện cho đơn vị/bộ phận nào?',
}

var askOrgQs = {
  1: 'Tên tổ chức Anh/Chị đang đại diện là gì?',
  2: 'Anh/Chị đang đại diện cho tổ chức nào?',
}

var askNameQs = {
  1: 'Vui lòng cho tôi biết tên đầy đủ của Anh/Chị?',
  2: 'Tôi có thể gọi Anh/Chị là gì nhỉ?',
  3: 'Tên đầy đủ của Anh/Chị là gì nhỉ?',
  4: 'Tôi tên là Đa, còn Anh/Chị là?',
  5: 'Mọi người thường gọi Anh/Chị là gì?',
  6: 'Tôi có thể biết tên của Anh/Chị không?',
  7: 'Tôi có thể biết tôi đang nói chuyện với ai được không?',
}

function sendGreeting(sender_psid) {
    let rsp_1;
    let rsp_2;
    rsp_2 = { "text": "Chào Anh/Chị!\nTôi là trợ lý của Tổ Thông tin đáp ứng nhanh cứu trợ thiên tai\n- Đội tình nguyện kêu gọi các tổ chức, cá nhân đã, đang và có mong muốn tham gia cứu trợ, trợ giúp đồng bào vùng lũ lụt hãy tham gia cập nhật thông tin trên hệ thống để hệ thống quay lại trợ giúp hoạt động cứu trợ hiệu quả hơn." }
    rsp_1 = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Anh/Chị muốn cứu trợ miền Trung phải không?",
                    "subtitle": "Anh/Chị có thể chọn nút ở bên dưới để trả lời",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Đúng vậy",
                            "payload": "dungvay",
                        },
                        {
                            "type": "postback",
                            "title": "Không phải",
                            "payload": "khongphai",
                        }
                    ],
                }]
            }
        }
    }

    // Sends the response message
    callSendAPI(sender_psid, rsp_2);
    //  setTimeout(function() {
    //   console.log('hello world!');
    //   }, 5000); 
    callSendAPI(sender_psid, rsp_1);
}
// Handles messages events
function handleMessage(sender_psid, received_message) {

    let response;

    // Check if the message contains text
    if (received_message.text) {
        if (received_message.text === 'Xin chào' || received_message.text === 'Bắt đầu trò chuyện') {
            sendGreeting(sender_psid);
        } else if (received_message.text === 'ten') {
            response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Anh/ Chị muốn ủng hộ theo cá nhân hay tổ chức?",
                            "subtitle": "Nhấn vào nút để trả lời.",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Cá nhân",
                                    "payload": "canhan",
                                },
                                {
                                    "type": "postback",
                                    "title": "Tổ chức",
                                    "payload": "tochuc",
                                },
                                {
                                    "type": "postback",
                                    "title": "Khác",
                                    "payload": "donvikhac",
                                }
                            ],
                        }]
                    }
                }
            }
            // response = { "text": curQ.toString() }
        } else if (received_message.text === 'tendonvi' || received_message.text === 'tentochuc') {
            let randNum = Math.floor(Math.random() * Object.keys(askPhoneNumQs).length) + 1;
            let txt = askPhoneNumQs[randNum];
            response = { "text": txt };
        }
    }
  
    else if (received_message.attachments) {

        // Gets the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }

        }
    }
    // Sends the response message
    callSendAPI(sender_psid, response);
}


// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Thanks mother fucker!" }
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another dick pic." }
    } else if (payload === 'dungvay') {
        let randNum = Math.floor(Math.random() * Object.keys(askNameQs).length) + 1;
        let txt = askNameQs[randNum];
        response = { "text": txt }
    } else if (payload === 'canhan') {
        let randNum = Math.floor(Math.random() * Object.keys(askPhoneNumQs).length) + 1;
        let txt = askPhoneNumQs[randNum];
        response = { "text": txt };
    } else if (payload === 'tochuc') {
        let randNum = Math.floor(Math.random() * Object.keys(askOrgQs).length) + 1;
        let txt = askOrgQs[randNum];
        response = { "text": txt };
    } else if (payload === 'donvikhac') {
        let randNum = Math.floor(Math.random() * Object.keys(askOtherOrgQs).length) + 1;
        let txt = askOtherOrgQs[randNum];
        response = { "text": txt };
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v7.0/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = {
    getHomepage: getHomepage,
    getWebhook: getWebhook,
    postWebhook: postWebhook,
}