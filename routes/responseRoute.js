const { connect } = require('../utils');
const url = require('url');
require('dotenv').config();
const { getMqttClient } = require('../mqtt');

async function generateUniqueID() {
    const timestamp = Date.now().toString(); 
    const randomNumber = Math.random().toString().substr(2, 10); 
    const uniqueID = timestamp + randomNumber; 
    return uniqueID.padEnd(16, '0'); 
}
  
async function responeHandler(req, res) {
    try {
	    const mqttClient = getMqttClient();
        const uniqueID = await generateUniqueID();
        const connection = await connect();
        
        const { query } = url.parse(req.url); 
        const params = query.split('&');
        let parsedQuery = {};
	    console.log('query', query);
        for (const param of params) {
            const [key, value] = param.split('=');
            parsedQuery[key] = value;
        }
        if (parsedQuery.code && parsedQuery.ip && parsedQuery.mac) {

            parsedQuery.mac = parsedQuery.mac.replace(/:/g, '');
            
	        console.log(parsedQuery);
            const selectHostsSQL = `SELECT * FROM Hosts WHERE MAC = ?`;
            const [rowsHosts] = await connection.execute(selectHostsSQL, [parsedQuery.mac]);
            
            const selectStaffSQL = `SELECT * FROM Staff WHERE Code = ?`;
            const [rowsStaff] = await connection.execute(selectStaffSQL, [parsedQuery.code]);
            
            if (rowsHosts.length > 0 && rowsStaff.length > 0) { 
                if (rowsStaff[0].CurrentRoom === '') {
		   console.log('enter1');
                    mqttClient.publish(rowsStaff[0].PublishTopicIn, uniqueID + ';' + rowsStaff[0].Role + ' ' + rowsStaff[0].Name + ' ' + rowsStaff[0].PublishPayloadIn + ' ' + rowsHosts[0].location);
                    const UpdateStaffSQL = `UPDATE Staff SET CurrentRoom = ? WHERE Code = ?`;
                    await connection.execute(UpdateStaffSQL, [parsedQuery.mac, parsedQuery.code]);

                } else if (rowsStaff[0].CurrentRoom === parsedQuery.mac) {
                    mqttClient.publish(rowsStaff[0].PublishTopicOut, uniqueID + ';' + rowsStaff[0].Role + ' ' + rowsStaff[0].Name + ' ' + rowsStaff[0].PublishPayloadOut + ' ' + rowsHosts[0].location);
                    const UpdateStaffSQL = `UPDATE Staff SET CurrentRoom = ? WHERE Code = ?`;
                    await connection.execute(UpdateStaffSQL, ['', parsedQuery.code]);

                } else {
                    const selectHostsStaffSQL = `SELECT * FROM Hosts WHERE MAC = ?`;
                    const [roomRowsHosts] = await connection.execute(selectHostsStaffSQL, [rowsStaff[0].CurrentRoom]);
                    mqttClient.publish(rowsStaff[0].PublishTopicOut, uniqueID + ';' + rowsStaff[0].Role + ' ' + rowsStaff[0].Name + ' ' + rowsStaff[0].PublishPayloadOut + ' ' + roomRowsHosts[0].location);
                    
                    const selectHostsSQL = `SELECT * FROM Hosts WHERE MAC = ?`;
                    const [newRowsHosts] = await connection.execute(selectHostsSQL, [parsedQuery.mac]);

                    mqttClient.publish(rowsStaff[0].PublishTopicIn, uniqueID + ';' + rowsStaff[0].Role + ' ' + rowsStaff[0].Name + ' ' + rowsStaff[0].PublishPayloadIn + ' ' + newRowsHosts[0].location);
                    const UpdateStaffSQL = `UPDATE Staff SET CurrentRoom = ? WHERE Code = ?`;
                    await connection.execute(UpdateStaffSQL, [parsedQuery.mac, parsedQuery.code]);
                }
                res.send('Success');
            } else {
                mqttClient.publish('ErrorTopic', 'User is not found');
                console.log('Error mqtt - User is not found');
                res.send('Error mqtt - User is not found');
            }
        } else {
            mqttClient.publish('ErrorTopic', 'Data parameter missing');
            console.log({ error: 'Data parameter missing' });
            res.send('Error mqtt - Data parameter missing');
        }
    } catch (err) {
        res.send('Fail');
    }
};

module.exports = responeHandler;
