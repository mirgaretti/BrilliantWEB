const { fs, path } = require('../../utils');

async function menuPageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/menu.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

module.exports = { menuPageHandler };