const { bodyParser } = require('./utils');
const express = require('express');
const session = require('express-session');
const app = express();
const http = require('http');
const port = process.env.BRILLIANT_PORT || 3001;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const { passport, checkAuthHandler, secure } = require('./passport');
const { connectionMqtt, connectSocket } = require('./mqtt');

app.use(
    session({
        secret: '1q2w3e4r5t6y',
        resave: false,
        saveUninitialized: true,
        name: "brilliant_app",
        cookie: {
            maxAge: 1000 * 60 * 60, 
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

const filePageHandler = require('./routes/pages/filePageRoute');
const { hostsPageHandler, editHostsPageHandler, addHostsPageHandler} = require('./routes/pages/hostsPageRoute');
const { staffPageHandler, editStaffPageHandler } = require('./routes/pages/staffPageRoute');
const mqttPageHandler = require('./routes/pages/mqttPageRoute');
const { authPageHandler, notAuthPageHandler } = require('./routes/pages/authPageRoute');
const { journalPageHandler, locationPageHandler } = require('./routes/pages/journalPageRoute');
const { menuPageHandler } = require('./routes/pages/menuPageRoute');

const { loadXlsxHandler, loadXmlHandler, checkFileHandler, importHandler, getPathHandler, setPathHandler } = require('./routes/api/files');
const { getHostsHandler, getHostsByIdHandler, updateHostsHandler, deleteHostsHandler, addHostsHandler, checkHostsDuplicateHandler }  = require('./routes/api/hosts');
const { getStaffHandler, getStaffByIdHandler, updateStaffHandler, deleteStaffHandler, setActiveStaffHandler, checkStaffDuplicateHandler }  = require('./routes/api/staff');
const { getMqttHandler, checkMqttHandler } = require('./routes/api/mqtt');
const { getNotifHandler, setCheckedNotifHandler } = require('./routes/api/notification')

const responeHandler = require('./routes/responseRoute');
const phoneHandler = require('./routes/phoneRoute');

app.post('/logout', (req, res) => {
  req.logout(() => {
      req.session.destroy((err) => {
          res.clearCookie('brilliant_app');
          res.send('Logged out');
      });
  });
});

app.post('/login', 
  passport.authenticate('local-login', {
      successRedirect: '/menu',
      failureRedirect: '/not-auth' 
  })
);

//Аутентификация
app.get('/auth', authPageHandler);
app.get('/not-auth', notAuthPageHandler);
app.get('/auth-check', checkAuthHandler);
app.get('/menu', secure, menuPageHandler);

//Адрес получения http get запроса с устройства
app.get('/akuvox', responeHandler);
app.get('/phone', phoneHandler);

// Страница настройки imp exp 
app.get('/files', secure, filePageHandler);
app.get('/getPath', secure, getPathHandler);
app.post('/setPath', secure, setPathHandler);

// таблица Hosts
app.get('/getHosts', secure, getHostsHandler);
app.post('/getHostsById', secure, getHostsByIdHandler);
app.get('/hostsPage', secure, hostsPageHandler);
app.get('/addHostsPage', secure, addHostsPageHandler);
app.post('/addHosts', secure, addHostsHandler);
app.get('/editHostsPage/:id', secure, editHostsPageHandler);
app.post('/updateHosts/:id', secure, updateHostsHandler);
app.post('/deleteHosts/:id', secure, deleteHostsHandler);
app.post('/checkHosts/:id', secure, checkHostsDuplicateHandler);

// таблица Staff
app.get('/getStaff', secure, getStaffHandler);
app.post('/getStaffById', secure, getStaffByIdHandler);
app.get('/staffPage', secure, staffPageHandler);
app.get('/editStaffPage/:id', secure, editStaffPageHandler);
app.post('/updateStaff/:id', secure, updateStaffHandler);
app.post('/deleteStaff/:id', secure, deleteStaffHandler);
app.post('/setActive/:id', secure, setActiveStaffHandler);
app.post('/checkStaff/:id', secure, checkStaffDuplicateHandler);

// Проверка брокера
app.get('/mqtt', secure, mqttPageHandler);
app.get('/getMqtt', secure, getMqttHandler);
app.get('/checkMqtt', secure, checkMqttHandler);

// Вызовы медперсонала
app.get('/journal', secure, journalPageHandler);
app.get('/location', secure, locationPageHandler);
app.get('/getNotifications', secure, getNotifHandler);
app.post('/setChecked', secure, setCheckedNotifHandler);

// функции с файлами 
app.post('/download-xml', secure, loadXmlHandler);
app.post('/download-xls', secure, loadXlsxHandler);
app.get('/import/:id', secure, importHandler);  
app.get('/check-file/:id', secure, checkFileHandler);

const server = http.createServer(app);
connectionMqtt();
connectSocket(server);

server.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

