require('dotenv').config();
const { getMqttClient } = require('../mqtt');

async function generateUniqueID() {
    const timestamp = Date.now().toString(); 
    const randomNumber = Math.random().toString().substr(2, 10); 
    const uniqueID = timestamp + randomNumber; 
    return uniqueID.padEnd(16, '0'); 
}
  
async function phoneHandler(req, res) {
    try {
        console.log('enter');
	    const mqttClient = getMqttClient();
        const uniqueID = await generateUniqueID();
        mqttClient.publish('Reset/GW/002', uniqueID + ';Сброс');
    } catch (err) {
        res.send('Fail');
    }
};

module.exports = phoneHandler;
