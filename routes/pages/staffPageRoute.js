const { fs, path } = require('../../utils');

async function staffPageHandler(itemId, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/staff/staff.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

async function editStaffPageHandler (req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/staff/editStaff.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

module.exports = { staffPageHandler, editStaffPageHandler };