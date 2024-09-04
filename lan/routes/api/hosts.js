const { getMqttClient } = require('../../mqtt');
const { connect } = require('../../utils');

async function getHostsHandler(req, res) {
    try {
        const connection = await connect();
        const selectSQL = 'SELECT id, name, ip, mac, cardfile, location FROM Hosts';
        const [rows] = await connection.execute(selectSQL);
        res.status(200).json(rows);
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({success: false});
    }
}

async function getHostsByIdHandler(req, res) {
    try {
        const connection = await connect();
        const id = req.body.id;
        const selectSQL = 'SELECT id, name, ip, mac, cardfile, location FROM Hosts WHERE id = ?';
        const [rows] = await connection.execute(selectSQL, [id]);
        res.status(200).json(rows[0]);
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({success: false});
    }
}

async function addHostsHandler(req, res) {
    try {
        const connection = await connect();
        const mqttClient = getMqttClient();
        const data = req.body;
        console.log(data);
        const insertSQL = `INSERT INTO Hosts (${Object.keys(data).join(', ')}) VALUES (${Object.keys(data).map(() => '?').join(', ')})`;

        await connection.execute(insertSQL, [...Object.values(data)]);
        mqttClient.subscribe(data.topic);
        res.status(200).send({success: true});
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({success: false});
    }
}

async function updateHostsHandler(req, res) {
    try {
        const connection = await connect();
    
        const recordId = req.params.id;
        const data = req.body;

        const updateSQL = `UPDATE Hosts SET ${Object.keys(data)
            .map((key) => `${key} = ?`)
            .join(', ')} WHERE id = ?`;
    
        const values = [...Object.values(data), recordId];
        const [results] = await connection.execute(updateSQL, values);
    
        if (results.affectedRows === 1) {
            res.status(200).send({ success: true }); 
        } else {
            res.status(500).send({ success: false }); 
        }
    
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false }); 
    }
};

async function deleteHostsHandler(req, res) {
    try {
        const connection = await connect();
        const id = req.params.id;

        const deleteSQL = 'DELETE FROM Hosts WHERE id = ?';
        await connection.execute(deleteSQL, [id]);
        console.log(`Запись с ID ${id} из таблицы Hosts удалена успешно.`);
        res.status(200).send({ success: true }); 
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false }); 
    }
}

async function checkHostsDuplicateHandler(req, res) {
    try {
        const connection = await connect();
        const data = req.body;
        const id = req.params.id;
        const selectIPSQL = 'SELECT ip FROM Hosts WHERE ip = ? AND id <> ? LIMIT 1';
        const [resultIP] = await connection.execute(selectIPSQL, [data.ip, id]);
        const selectMACSQL = 'SELECT mac FROM Hosts WHERE mac = ? AND id <> ? LIMIT 1';
        const [resultMAC] = await connection.execute(selectMACSQL, [data.mac, id]);
        console.log(resultIP, resultMAC);
        res.status(200).send({ ip: resultIP[0]?.ip == data.ip ? 'true' : 'false', mac: resultMAC[0]?.mac == data.mac ? 'true' : 'false' }); 
        connection.end();
        // res.status(200).send({ ip: resultIP[0]?.ip == data.ip ? 'duplicate' : 'single', mac: resultMAC[0]?.mac == data.mac ? 'duplicate' : 'single' }); 
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false }); 
    }
}


module.exports = { 
    getHostsHandler,
    getHostsByIdHandler,
    updateHostsHandler, 
    deleteHostsHandler,
    addHostsHandler, 
    checkHostsDuplicateHandler };
