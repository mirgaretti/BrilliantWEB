const { fs, path, connect, getConfig } = require('../../utils');
const ExcelJS = require('exceljs');
const xml2js = require('xml2js');

async function loadXlsxHandler(req, res) {
    try {
        const config = getConfig();
        const exportPath = config.exportPath;
        const filename = req.body.filename;
        const connection = await connect();
        console.log('enter');
        const selectSQL = 'SELECT type, name, ip, mac, cardfile, topic, location FROM Hosts';
        const [rows] = await connection.execute(selectSQL);

        if (rows.length > 0) {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Hosts');

            const columns = Object.keys(rows[0]);
            worksheet.addRow(columns);
            
            rows.forEach((row) => {
                worksheet.addRow(Object.values(row));
            });
            
            const fullPath = path.join(exportPath, `${filename}.xls`);

            workbook.xlsx.writeFile(fullPath)
                .then(() => {
                    console.log('Файл успешно сохранен по пути:', fullPath);
                    res.setHeader('Content-disposition', `attachment; filename="${filename}.xls"`);
                    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.sendFile(fullPath); 
                })
                .catch((err) => {
                    console.error('Ошибка записи файла:', err);
                    res.status(500).send('Ошибка записи файла');
                });
        } else {
            res.status(404).send('Нет данных для экспорта');
        }

        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send('Ошибка экспорта');
    }
}

async function loadXmlHandler (req, res) {
    try {
        const config = getConfig();
        const exportPath = config.exportPath;
        const filename = req.body.filename;
        console.log(filename);
        const connection = await connect();
    
        const selectSQL = 'SELECT * FROM Staff WHERE Active=1';
        const [rows] = await connection.execute(selectSQL);
    
        if (rows.length > 0) {
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            xml += `<KeyData>\n`;
        
            rows.forEach((row) => {
                if (row.Schedule1 != null) {
                    xml += `  <Key ID="${row.id}" Admin="${row.Admin}" Name="${row.Name}" Code="${row.Code}" DoorNum="${row.DoorNum}" WebRelay="${row.WebRelay}" Mon="${row.Mon}" Tue="${row.Tue}" Wed="${row.Wed}" Thur="${row.Thur}" Fri="${row.Fri}" Sat="${row.Sat}" Sun="${row.Sun}" TimeStart="${row.TimeStart}" TimeEnd="${row.TimeEnd}" Floor="${row.Floor}" Cloud="${row.Cloud}" DeviceName="${row.DeviceName}" Addr="${row.Addr}" Tags="${row.Tags}" Frequency="${row.Frequency}" DayStart="${row.DayStart}" DayEnd="${row.DayEnd}" CardType="${row.CardType}">\n`;
                    
                    for (let i = 1; i <= 5; i++) {
                        const scheduleID = row[`Schedule${i}`];
                        if (scheduleID != null) {
                            xml += `    <Schedule ID="${scheduleID}"/>\n`;
                        }
                    }
                    xml += `</Key>`;
                } else {
                    xml += `  <Key ID="${row.id}" Admin="${row.Admin}" Name="${row.Name}" Code="${row.Code}" DoorNum="${row.DoorNum}" WebRelay="${row.WebRelay}" Mon="${row.Mon}" Tue="${row.Tue}" Wed="${row.Wed}" Thur="${row.Thur}" Fri="${row.Fri}" Sat="${row.Sat}" Sun="${row.Sun}" TimeStart="${row.TimeStart}" TimeEnd="${row.TimeEnd}" Floor="${row.Floor}" Cloud="${row.Cloud}" DeviceName="${row.DeviceName}" Addr="${row.Addr}" Tags="${row.Tags}" Frequency="${row.Frequency}" DayStart="${row.DayStart}" DayEnd="${row.DayEnd}" CardType="${row.CardType}"/>\n`;
                }
            });
        
            xml += `</KeyData>`;
            const root = process.cwd();
            const fullPath = path.join(exportPath, `${filename}.xml`);

            res.setHeader('Content-disposition', `attachment; filename="${filename}.xml"`);
            res.set('Content-Type', 'text/xml');
            
            fs.writeFile(fullPath, xml, (err) => {
            if (err) {
                res.status(500).send({ success: true });
            } else {
                console.log('Файл успешно сохранен по пути:', fullPath);
                res.status(200).send({ success: false });
            }
            });
        } else {
            res.status(404).send({ success: false });
        }
    
        connection.end();
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send('Ошибка');
    }
};

async function checkFileHandler (req, res) {
    try {
        const connection = await connect();
  
        const recordId = req.params.id;
        const selectSQL = 'SELECT cardfile FROM Hosts WHERE id = ?';
        const [rows] = await connection.execute(selectSQL, [recordId]);
        const fileName = rows[0].cardfile;
        const config = getConfig();
        const filePath = path.join(config.importPath, fileName);
        if (fs.existsSync(filePath)) {
            res.status(200).send({ success: true });
        } else {
            res.status(404).send({ success: false });
        }
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false });
    }
};

async function importHandler (req, res) {
    try {
        const connection = await connect();
  
        const recordId = req.params.id;
        const config = getConfig();
  
        const selectSQL = 'SELECT cardfile FROM Hosts WHERE id = ?';
        const [rows] = await connection.execute(selectSQL, [recordId]);
        const fileName = rows[0].cardfile;

        const filePath = path.join(config.importPath, fileName);

        const xmlData = fs.readFileSync(filePath, 'utf-8');

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);
        const keyData = result.KeyData.Key;

        const dropTableSQL = `DELETE FROM Staff`;
        await connection.execute(dropTableSQL);

        for (const item of keyData) {
            const scheduleValues = Array.from({ length: 5 }, (_, i) => item.Schedule && item.Schedule[i] ? item.Schedule[i].$.ID : "");
            const fieldNames = Object.keys(item.$).filter(fieldName => fieldName !== 'ID').map(fieldName => fieldName === 'Name' ? 'name' : (fieldName === 'Code' ? 'code' : fieldName));
            const insertSQL = `INSERT INTO Staff (${fieldNames.join(', ')}, Schedule1, Schedule2, Schedule3, Schedule4, Schedule5) VALUES (${fieldNames.map(() => '?').join(', ')}, ?, ?, ?, ?, ?)`;
            const values = Object.keys(item.$)
            .filter(fieldName => fieldName !== 'ID') 
            .map(fieldName => {
                return item.$[fieldName]; 
            })
            .concat(scheduleValues);
            const [results] = await connection.query(insertSQL, values);
        }
        connection.end();
        
        res.status(200).send({ success: true });
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: false });
    }
};

async function setPathHandler(req, res) {
    try {
        const importPath = req.body.importPath;
        const exportPath = req.body.exportPath;
        const configData = `importPath='${importPath}';\nexportPath='${exportPath}';\n`;

        const filePath = path.join(__dirname, '../../config/app.config');
    
        fs.writeFile(filePath, configData, (err) => {
            if (err) {
                console.error('Ошибка при записи в файл:', err);
                res.status(500).send({ success: true })
            } else {
                console.log('Файл app.config был успешно обновлен.');
                res.status(200).send({ success: true })
            }
        });
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: true })
    }
};

async function getPathHandler(req, res) {
    try {
        const result = getConfig(); 
        res.status(200).send(result);
    } catch (err) {
        console.error('Ошибка:', err);
        res.status(500).send({ success: true })
    }
};

module.exports = { 
    loadXlsxHandler,
    loadXmlHandler,
    checkFileHandler,
    importHandler,
    getPathHandler,
    setPathHandler };
