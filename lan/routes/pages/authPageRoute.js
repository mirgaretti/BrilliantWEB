const { fs, path } = require('../../utils');

async function authPageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/auth/login.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

async function notAuthPageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/auth/notAuth.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

module.exports = { authPageHandler, notAuthPageHandler };