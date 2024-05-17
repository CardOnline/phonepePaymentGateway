const express = require('express');
const port = 3002;
const app = express();
const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');

//testing purpose
const PhonePayUatUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const MerchandID = 'PGTESTPAYUAT';
const SaltIndex = 1;
const SaltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
app.get("/", (req, res) => {
    res.send("PhonePay app is working")
});

app.get("/pay", (res, req) => {
    const payEndpoint = '/pg/v1/pay';
    const merchantTransactionId = uniqid();
    merchantUserId = 123;
    const payload = {
        "merchantId": MerchandID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": merchantUserId,
        "amount": 1000, //in paise
        "redirectUrl": `http://localhost:3002/redirect-url/${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        "callbackUrl": `https://localhost:3002/callback-url/${merchantTransactionId}`,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        },
        "mobileNumber": "9999999999"
    };
    // SHA256(base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64EncodedPayload = bufferObj.toString("base64");
    const xVerify = sha256(base64EncodedPayload+payEndpoint+SaltKey)+"###"+SaltIndex;

    const options = {
        method: 'post',
        url: `${PhonePayUatUrl}${payEndpoint}`,
        headers: {
            // accept: 'text/plain',
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify
        },
        data: {
            request: base64EncodedPayload,
        }
    };
    axios
        .request(options)
            .then(function (response) {
                console.log(response.data);
                res.send(response.data)
            })
        .catch(function (error) {
            console.error(error);
        });

});

app.listen(port, () => {
    console.log(`App started listning on port ${port}`);
});