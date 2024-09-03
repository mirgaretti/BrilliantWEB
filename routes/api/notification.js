const { getMqttClient } = require('../../mqtt');
const { connect, currentTime } = require('../../utils');


async function getNotifHandler(req, res) {
    try {
        const connection = await connect();
        const count = req.query.count;
        const selectSQL = `SELECT * FROM Notifications ORDER BY currtime DESC LIMIT ?`;
        const [rows] = await connection.execute(selectSQL, [count]);
        res.status(200).json(rows);
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({success: false});
    }
}

async function setCheckedNotifHandler(req, res) {
    try {
        const mqttClient = getMqttClient();
        const connection = await connect();
        const id = req.body.data.id;
        const value = req.body.data.value;
      
        mqttClient.publish('Confirm', id + ';' + value);
        await connection.close();
        res.status(200).send({success: true});
    } catch (error) {
        console.error(error);
        res.status(500).send({success: false});
    }
}

module.exports = { getNotifHandler, setCheckedNotifHandler };