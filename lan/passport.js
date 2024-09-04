const passport = require('passport');
const bcrypt = require('bcrypt');
const { connect } = require('./utils');
const LocalStrategy = require('passport-local').Strategy;

async function serializeUser(user, done) {
    done(null, { id: user.id, name: user.name });
}

async function deserializeUser(connection, user, done) {
    const sqlSelect = `SELECT * FROM Users WHERE name = ?`;
    const [rows] = await connection.execute(sqlSelect, [user.name]);
    done(null, rows[0]);
}

async function localLogin(connection, username, password, done) {
    try {
        const sqlSelect = `SELECT * FROM Users WHERE name = ?`;
        const [rows] = await connection.execute(sqlSelect, [username]);
        
        if (!rows.length) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        
        const user = rows[0];
        const isMatch = await new Promise((resolve, reject) => {
            bcrypt.compare(password, user.passwordHash, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });

        if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        return done(null, { id: user.id, name: user.name });
        
    } catch (error) {
        return done(error);
    }
}
  
passport.serializeUser(serializeUser);

passport.deserializeUser(async (user, done) => {
    try {
        const connection = await connect();
        await deserializeUser(connection, user, done);
        await connection.end(); 
    } catch (error) {
        done(error);
    }
});

passport.use('local-login', new LocalStrategy({
    nameField: 'name',
    passwordField: 'password'
}, async (name, password, done) => {
    try {
        const connection = await connect();
        await localLogin(connection, name, password, done);
        await connection.end(); 
    } catch (error) {
        done(error);
    }
}));

//===========================================
async function loginAuthHandler(req, res) {
    try {
        passport.authenticate('local-login', {
            successRedirect: '/files',
            failureRedirect: '/not-auth' 
        })
    } catch (err) {
        console.error('Ошибка:', err);
    }
} 

async function checkAuthHandler(req, res) {
    try {
        if (!req.isAuthenticated()) {
            return res.send('no-auth');
        }
        return res.send('ok');
    } catch (err) {
        console.error('Ошибка:', err);
    }
} 

const secure = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/not-auth');
    }
    next();
};

module.exports = {
    passport,
    loginAuthHandler, 
    checkAuthHandler, 
    secure
};
