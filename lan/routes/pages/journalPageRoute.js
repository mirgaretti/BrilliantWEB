const { fs, path } = require('../../utils');

async function journalPageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/journal/journal.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

async function locationPageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/journal/location.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};


module.exports = { journalPageHandler, locationPageHandler };