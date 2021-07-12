const twilioAccountSID = process.env.TWILIO_ACC_SID;
const twilioAuthToken = process.env.TWILIO_TOKEN;
const twillioClient = require('twilio')(twilioAccountSID,twilioAuthToken);
//const Joi = require('joi');
const cors = require('cors');
const express = require('express');
const http = require('http');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const EventEmitter = require('events');

const eventEmitter = new EventEmitter();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

let statusUpdates = [];
/**
* Resource - Send SMS to a List of Recepients
* Content-Type - application/json
* @req.body    {
                "from":"{String}",
                "to":[
                    {"number":"{String}","message":"{String}"},
                    {"number":"{String}","message":"{String}"}
                ]}
*/
app.post('/sms',(req,res) => {
    const sentFrom = req.body.from; //string
    const recepientsList = req.body.to; //array of phone numbers
    const messageBody = req.body.message; //string
    const callbackUrl = 'https://twilio.loca.lt/sms/status'

    //console.log(req.body);

    // Iterates the array of recepients and send messages
    recepientsList.forEach( recepient =>{
        let text = `${recepient.name},\n${messageBody}`;
        let message = twillioClient.messages.create({
            from: sentFrom,
            to: recepient.number,
            body: text,
            statusCallback: callbackUrl
        })
        .then(message => console.log(message.status))
        .catch(error => {
            console.log(error);
            let update = {
                to: recepient.number,
                messageSid: recepient.number,
                status: 'failed'
            }
            //statusUpdates.push(update);
            eventEmitter.emit('update',update);
        })
        .done();
    });
    res.header("Access-Control-Allow-Origin", "*");
    res.sendStatus(202);
});

/**
* Resource - To receive Status Updates of submitted messages (from Twilio)
* Content-Type - application/x-www-form-urlencoded
* @req.body    SmsSid={String}
                &SmsStatus=delivered|sent
                &MessageStatus=delivered|sent
                &To={String}
                &MessageSid={String}
                &AccountSid={String}
                &From={String}
                &ApiVersion={String}
*/
app.post('/sms/status',(req,res) =>{
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;
    const recepient = req.body.To;
    //console.log(req.body);
    //console.log(`SID: ${messageSid}, Status: ${messageStatus}`);
    let update = {
        to: recepient,
        messageSid: messageSid,
        status: messageStatus
    }
    //statusUpdates.push(update);
    eventEmitter.emit('update',update);
    res.sendStatus(200);
});

/**
* Resource - To allow frontend app to receive updates
* Content-Type - application/x-www-form-urlencoded
* @req.body    SmsSid={String}
                &SmsStatus=delivered|sent
                &MessageStatus=delivered|sent
                &To={String}
                &MessageSid={String}
                &AccountSid={String}
                &From={String}
                &ApiVersion={String}
*/
app.get('/sms/server/events', (req,res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

    eventEmitter.on('update', (update) => {
        res.write(`id: ${update.messageSid}\n`);
        res.write(`data: ${JSON.stringify({ update: update })}\n\n`);
    });

    res.on('close', () => {
        console.log('Client connection terminated!');
        //res.end();
    });
});

/**
* Resource - To receive reply messages from the Client Mobile Phone
* Content-Type - application/x-www-form-urlencoded
* @req.body    SmsSid={String}
                &SmsStatus=delivered|sent
                &MessageStatus=delivered|sent
                &To={String}
                &MessageSid={String}
                &AccountSid={String}
                &From={String}
                &ApiVersion={String}
*/
app.post('/sms/reply',(req, res) =>{
    const twiml = new MessagingResponse();

    twiml.message('Thank you. Your response is received');
    console.log(req.body);
    let update = {
        to: req.body.From,
        messageSid: req.body.messageSid,
        messageBody: req.body.Body
    }
    //statusUpdates.push(update);
    eventEmitter.emit('update',update);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

const port = process.env.PORT || 3000
app.listen(port, ()=> console.log(`Server Started. Listening to port ${port}...`));
