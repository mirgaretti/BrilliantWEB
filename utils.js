const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const getConfig = () => {
    const filePath = path.join(__dirname, '/config/app.config');
    const data = fs.readFileSync(filePath, 'utf8'); 
    let result = { importPath : '', exportPath : ''} ;
    result.importPath = data.match(/importPath='([^']*)'/)[1]; 
    result.exportPath = data.match(/exportPath='([^']*)'/)[1]; 
    return result;
}

const connect = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost', 
        database: process.env.DB_NAME || '',
        user: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || ''       
    });
    return connection;
}

function currentTime () {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  
    return formattedDate = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function splitString(str) {
    const splitArray = str.split(';');
    if (splitArray.length < 2) {
        return "Ошибка: в строке должна быть только одна точка с запятой.";
    }
    const beforeSemicolon = splitArray[0];
    const afterSemicolon = splitArray.slice(1).join(';'); // Объединяем все элементы после первой точки с запятой
    return { beforeSemicolon, afterSemicolon };
}

function transformString(inputString) {
    const parts = inputString.split('/');
    let result = '';
    if (inputString.includes('PTP')) {
        result = `${parts[3]}-${parts[4]}`;        
    } else {
        result = `TP-${parts[2]}-${parts[3]}`;
    }
    return result;
}

module.exports = {
    fs,
    path,
    bodyParser,
    getConfig,
    connect,
    currentTime,
    splitString,
    transformString
};