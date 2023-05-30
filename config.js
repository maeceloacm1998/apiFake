const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')

// Instaciacao do que precisa
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Execucao das config do server
server.use(middlewares);
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(jsonServer.defaults());

// CONSTANTES
const SECRET_KEY = '123456789'
const expiresIn = '1h'

// Create a token from a payload 
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token 
function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database
function isAuthenticated({ email, password, data }) {
    return data.users.findIndex(user => user.email === email && user.password === password) !== -1
}

// Exist users
function oneUserExist(data) {
    return data.users.length != 0
}

// Register New User
server.post('/auth/registe', (req, res) => {
    const { email, password, nome, descricaoPerfil, github } = req.body;

    fs.readFile("./db.json", (err, data) => {
        if (err) {
            const status = 401
            const message = err
            res.status(status).json({ status, message })
            return
        };

        // Get current users data
        var data = JSON.parse(data.toString());

        if (isAuthenticated({ email, password, data }) === true) {
            const status = 401;
            const message = 'Email and Password already exist';
            res.status(status).json({ status, message });
            return
        }

        // Get the id of last user
        var last_item_id = oneUserExist(data) ? data.users[data.users.length - 1].id : 1
        var newId = last_item_id + 1
        //Add new user
        data.users.push({
            id: newId,
            email: email,
            password: password,
            nome: nome,
            descricaoPerfil: descricaoPerfil,
            github: github
        });


        fs.writeFile("./db.json", JSON.stringify(data), (err, result) => {
            if (err) {
                const status = 401
                const message = err
                res.status(status).json({ status, message })
                return
            } else {
                const status = 200
                console.log(result)
                const message = JSON.stringify(result)
                res.status(status).json({ status, message })
                return
            }
        });
    });

})

// CONFIG PORTA DE ENTRADA PARA O SERVER
server.use(router)
server.listen(8000, () => {
    console.log('Run Auth API Server')
})