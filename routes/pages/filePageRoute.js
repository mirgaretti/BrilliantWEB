const { fs, path } = require('../../utils');

async function filePageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/files/files.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

module.exports = filePageHandler;