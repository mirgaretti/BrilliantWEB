const { connect } = require('../../utils');
const { reSubscribeTopics } = require('../../mqtt');

async function getStaffHandler(req, res) {
    try {
        const connection = await connect();
        const scope = req.body.scope;
        let rows;
        if (scope == 'full') {
            selectSQL = `SELECT * FROM Staff`;
            [rows] = await connection.execute(selectSQL);
        } else {
            selectSQL = 'SELECT id, Active, Name, Admin, Role, Code, PublishTopicIn, PublishPayloadIn, PublishTopicOut, PublishPayloadOut FROM Staff';
            [rows] = await connection.execute(selectSQL);
        }
        res.status(200).json(rows);
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({success: false});
    }
}

async function getStaffByIdHandler(req, res) {
    try {
        const connection = await connect();
        const id = req.body.id;
        selectSQL = `SELECT * FROM Staff WHERE id = ?`;
        const [rows] = await connection.execute(selectSQL, [id]);
        res.status(200).json(rows[0]);
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({success: false});
    }
}

async function updateStaffHandler(req, res) {
    try {
        const connection = await connect();
    
        const recordId = req.params.id;
        const newData = req.body;
        await reSubscribeTopics(recordId, newData, 'edit');
        const updateSQL = `UPDATE Staff SET ${Object.keys(newData)
            .map((key) => `${key} = ?`)
            .join(', ')} WHERE id = ?`;
            
        const values = [...Object.values(newData), recordId];
        const [results] = await connection.execute(updateSQL, values);
        res.status(200).send({ success: true });
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false });
    }
};

async function deleteStaffHandler(req, res) {
    try {
        const connection = await connect();
        const id = req.params.id;
        await reSubscribeTopics(id, '', 'delete');

        const deleteSQL = 'DELETE FROM Staff WHERE id = ?';
        await connection.execute(deleteSQL, [id]);

        console.log(`Запись с ID ${id} из таблицы Staff удалена успешно.`);
        res.status(200).send({ success: true }); 
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false }); 
    }
}

async function setActiveStaffHandler(req, res) {
    try {
        const connection = await connect();
        const itemId = req.params.id;
        const isChecked = req.body.isChecked;

        const updateSQL = 'UPDATE Staff SET Active = ? WHERE id = ?';
        const [result] = await connection.execute(updateSQL, [isChecked, itemId]);

        connection.end();

        if (result.affectedRows === 1) {
            res.status(200).send('Статус успешно обновлен');
        } else {
            res.status(500).send('Не удалось обновить статус');
        }
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).send('Произошла ошибка сервера');
    }
}

async function checkStaffDuplicateHandler(req, res) {
    try {
        const connection = await connect();
        const data = req.body;
        const id = req.params.id;
        console.log(data);
        const selectCodeSQL = 'SELECT Code FROM Staff WHERE Code = ? AND id <> ? LIMIT 1';
        const [result] = await connection.execute(selectCodeSQL, [data.Code, id]);
        console.log(result);
        res.status(200).send({ code: result[0]?.Code == data.Code ? 'true' : 'false' }); 
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false }); 
    }
}

module.exports = { 
    getStaffHandler, 
    getStaffByIdHandler, 
    updateStaffHandler, 
    deleteStaffHandler,
    setActiveStaffHandler, 
    checkStaffDuplicateHandler };