const { fs, path } = require('../../utils');

async function hostsPageHandler(req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/hosts/hosts.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
}

async function editHostsPageHandler (req, res) {
    try {
        const filePathHtml = path.join(__dirname, '../../public/html/hosts/editHosts.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
};

async function addHostsPageHandler(req, res) {
    try { 
        const filePathHtml = path.join(__dirname, '../../public/html/hosts/addHosts.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    } catch (err) {
        console.error('Ошибка:', err);
        const filePathHtml = path.join(__dirname, '../../public/html/error.html');
        const html = fs.readFileSync(filePathHtml, 'utf-8');
        res.send(html);
    }
}

module.exports = { hostsPageHandler, editHostsPageHandler, addHostsPageHandler };