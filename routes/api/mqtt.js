require('dotenv').config();
const { getMqttClient } = require('../../mqtt');

async function getMqttHandler (req, res) {
    try {
        const data = { 
            host: process.env.MQTT_HOST,
            port: process.env.MQTT_PORT,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD
        }
        console.log(data);
        res.status(200).send(data);
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false });
    }
};

async function checkMqttHandler(req, res) {
    try {
        const mqttClient = getMqttClient();
        let success = false;
        let responseSent = false; 
        mqttClient.subscribe('TestTopic'); 
        mqttClient.publish('TestTopic', 'Success');

        const testListener = (topic, message) => {
            if (topic === 'TestTopic' && message.toString() === 'Success') {
                success = true;
            }
            console.log(`Received message on topic ${topic}: ${message.toString()}`);

            if (!responseSent) {
                responseSent = true; 
                clearTimeout(timeoutId); 
                mqttClient.removeListener('message', testListener);
                return res.status(200).send({ success: success });
            }
        };

        mqttClient.on('message', testListener);

        const timeoutId = setTimeout(() => {
            if (!responseSent) { 
                responseSent = true; 
                mqttClient.removeListener('message', testListener);
                return res.status(200).send({ success: false }); 
            }
        }, 3000);

    } catch (err) {
        res.status(500).send({ success: false });
    }
}


module.exports = { getMqttHandler, checkMqttHandler };
