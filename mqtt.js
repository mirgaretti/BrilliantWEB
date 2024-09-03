const { Server } = require('socket.io');
const mqtt = require('mqtt');
const { connect, currentTime, splitString, transformString } = require('./utils');
require('dotenv').config();

let mqttClient;
let mqttClientConnected = true;
let io;
let alerts = [];
let signal = 50;
let status = 'RSSI/Cancel/GW/002/001';

const connectSocket = (server) => {
    io = new Server(server);
    io.on('connection', () => {
        io.emit('mqtt_status', mqttClientConnected ? '✔️ Подключено к брокеру' :  '❌ Не подключено к брокеру');
        io.emit('alert', alerts);
        io.emit('signal', signal);
        io.emit('status', status);
    });
};

const connectionMqtt = async () => {
    client = await createClient();
    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        mqttClientConnected = true;
    });
    
    client.on('close', () => {
        console.log('Disconnected from MQTT Broker');
        mqttClientConnected = false;
    });

    client.on('message', async (topic, message) => {
        const testFormat = message.toString().split(';'); 
        const { beforeSemicolon, afterSemicolon } = splitString(message.toString());
        if (testFormat.length != 2) {
            if (topic == 'Event/Navi/RSSI/GW/002/001' || topic == 'RSSI/SOS/GW/002/001' || topic == 'RSSI/Cancel/GW/002/001') {
                const match = afterSemicolon.match(/rssi=([-+]?\d+)/); 
                signal = match ? Math.abs(parseInt(match[1], 10)) : 30;
                io.emit('signal', signal);
                if (topic.startsWith('RSSI')) {
                    io.emit('status', topic);
                    status = topic;
                }
            } else {
                const noid = {topic: topic, message: message.toString()}
                io.emit('noid', noid);
            }
        } else if (topic == 'Confirm') {
            console.log('Confirm', message.toString());
            const connection = await connect();
            let confirm = {id: '', value: '', commentTime: '', toggle: '0'};
            const { beforeSemicolon, afterSemicolon } = splitString(message.toString());
            confirm.id = beforeSemicolon;
            confirm.value = afterSemicolon;
            confirm.commentTime = currentTime();
            const sqlSelect = `SELECT toggle FROM Notifications WHERE id = ?`;
            const [resultSelect] = await connection.execute(sqlSelect, [confirm.id]);
            console.log('resultSelect', resultSelect);
            if (resultSelect[0].toggle == '0') {
                const sqlUpdate = `UPDATE Notifications SET toggle = '1', comment = ?, commentTime = ? WHERE id = ?`;
                const [resultUpdate] = await connection.execute(sqlUpdate, [confirm.value, confirm.commentTime, confirm.id]);
                confirm.toggle = '0';
            } else {
                confirm.toggle = '1';
            }
            io.emit('confirm', confirm);
        } else {
            const { beforeSemicolon, afterSemicolon } = splitString(message.toString());
            const connection = await connect();
            let notification = {id: '', color: '', topic: '', payload: '', background: '',  currtime: '', toggle: '0'};
            notification.id = beforeSemicolon;
            notification.payload = afterSemicolon;
            notification.currtime = currentTime();
            notification.topic = topic;
            if (topic.startsWith('SOS')) {
                notification.color = 'rgba(255, 75, 75, 1)';
                notification.background = 'rgba(255, 75, 75, 0.2)';
            } else if (topic.startsWith('Cancel')) {
                notification.color = 'rgba(26, 198, 70, 1)';
                notification.background = 'rgba(26, 198, 70, 0.2)';
            } else {
                notification.color = 'rgba(120, 35, 232, 1)';
                notification.background = 'rgba(120, 35, 232, 0.2)';
            }
            
            io.emit('notification', notification);

            const sql = `INSERT INTO Notifications (id, topic, message, payload, color, background, currtime, toggle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const [result] = await connection.execute(sql, [notification.id, topic, message.toString(), notification.payload, notification.color, notification.background, notification.currtime, notification.toggle]);
            
            if (topic == 'SOS/GW/002/007' || topic == 'SOS/GW/002/008' || topic == 'SOS/GW/002/PTP/001') {
                const ptId = transformString(topic);
                if (!alerts.includes(ptId)) { 
                    alerts.push(ptId); 
                }
                io.emit('alert', alerts); 
            } else if (topic == 'Reset/GW/002') {
                alerts = alerts.filter(alert => !alert.startsWith('TP'));
                io.emit('alert', alerts);
            } else if (topic == 'Cancel/GW/002/PTP/001') {
                alerts = alerts.filter(alert => !alert.startsWith('PTP'));
                io.emit('alert', alerts);
            }
        }
    });
};

const createClient = async () => {
    if (mqttClient) {
        mqttClient.end();
    }
    const options = {
        host: process.env.MQTT_HOST || 'mqtt://localhost', 
        port: process.env.MQTT_PORT || '1883',
        username: process.env.MQTT_USERNAME || '',
        password: process.env.MQTT_PASSWORD || '',
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        keepalive: 60 
    };
    const connection = await connect();
    const sql = `SELECT PublishTopicIn, PublishTopicOut FROM Staff`;
    const [result] = await connection.execute(sql);
    mqttClient = mqtt.connect(options);
    mqttClient.subscribe('SOS/GW/002/007');
    mqttClient.subscribe('SOS/GW/002/007');
    mqttClient.subscribe('SOS/GW/002/008');
    mqttClient.subscribe('SOS/GW/002/PTP/001');
    mqttClient.subscribe('Cancel/GW/002/PTP/001');
    mqttClient.subscribe('RSSI/SOS/GW/002/001');
    mqttClient.subscribe('RSSI/Cancel/GW/002/001');
    mqttClient.subscribe('Reset/GW/002');
    mqttClient.subscribe('Confirm');
    mqttClient.subscribe('Event/Navi/RSSI/GW/002/001');
    result.forEach(({PublishTopicIn, PublishTopicOut}) => {
        if (PublishTopicIn) {
            mqttClient.subscribe(PublishTopicIn);
        }
        if (PublishTopicOut) {
            mqttClient.subscribe(PublishTopicOut);
        }
    })
    return mqttClient;
};

const getMqttClient = () => mqttClient;

async function reSubscribeTopics(id, newData, type) {
    const connection = await connect();
    const mqttClient = getMqttClient();
    const selectTopicsSQL = `SELECT PublishTopicIn, PublishTopicOut FROM Staff WHERE id = ?;`;
    const [resultTopics] = await connection.execute(selectTopicsSQL, [id]);
    const countTopicsSQL = `SELECT 
        (SELECT COUNT(*) FROM Staff WHERE PublishTopicIn = ?) AS TopicInCount,
        (SELECT COUNT(*) FROM Staff WHERE PublishTopicOut = ?) AS TopicOutCount;
    `;
    const [resultCount] = await connection.execute(countTopicsSQL, [resultTopics[0].PublishTopicIn, resultTopics[0].PublishTopicOut]);

    if (type == 'edit') {
        if (newData.PublishTopicIn != resultTopics[0].PublishTopicIn) {
            if (resultCount[0].TopicInCount == 1) {
                mqttClient.unsubscribe(resultTopics[0].PublishTopicIn);
            } 
            mqttClient.subscribe(newData.PublishTopicIn);
        }
    
        if (newData.PublishTopicOut != resultTopics[0].PublishTopicOut) {
            if (resultCount[0].TopicOutCount == 1) {
                mqttClient.unsubscribe(resultTopics[0].PublishTopicOut);
            } 
            mqttClient.subscribe(newData.PublishTopicOut);
        }
    } else if (type == 'delete') {
        if (resultCount[0].TopicInCount == 1) {
            mqttClient.unsubscribe(resultTopics[0].PublishTopicIn);
        } 
        if (resultCount[0].TopicOutCount == 1) {
            mqttClient.unsubscribe(resultTopics[0].PublishTopicOut);
        } 
    }
}

module.exports = { connectionMqtt, getMqttClient, connectSocket, createClient, reSubscribeTopics };
