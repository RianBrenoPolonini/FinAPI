const { response } = require('express');
const express = require('express');
const {v4: uuid4 } = require('uuid');

const app = express();

app.use(express.json());

const dados = [];

// Middleware
function verifyIfExistsAccountCPF(req, resp, next){
    const {cpf} = req.headers;
    const user = dados.find((dado) => dado.cpf === cpf);

    if(!user){
        return resp.status(400).json({ error: "Usuário não existe"});
    }

    req.user = user;
    
    return next();
};

function getBalance(operacoes) {
    const balance = operacoes.reduce((acc, operacao) => {
        if(operacao.type === 'Credit'){
            return acc + operacao.amount;
        }else{
            return acc - operacao.amount;
        }
    }, 0);

    return balance;
};

app.post("/account", (req, resp) => {
    const { cpf, name} = req.body;

    const cpfExists = dados.some(
        (dados) => dados.cpf === cpf
    );

    if(cpfExists){
        return resp.status(400).json({ error: "CPF já cadastrado"})
    }

    dados.push({
        cpf,
        name,
        id: uuid4(),
        operacoes: []
    });
    return resp.status(201).send("Usuário cadastrado com sucesso");
});

app.get("/operacoes",verifyIfExistsAccountCPF, (req, resp) => {
    const {user} = req;
    return resp.json(user.operacoes);
});

app.get("/", (req, resp) => {
    return resp.json(dados);
});

app.post("/deposito", verifyIfExistsAccountCPF, (req,resp) => {
    const {description, amount} = req.body;
    const {user} = req;

    const operacoes = {
        description,
        amount,
        created_at: new Date(),
        type: "Credit",
    };

    user.operacoes.push(operacoes);

    return resp.status(201).send("Deposito realizado com sucesso")
});

app.post("/saque", verifyIfExistsAccountCPF, (req,resp) => {
    const {amount} = req.body;
    const {user} = req;

    const saldo = getBalance(user.operacoes);

    if(saldo < amount){
        return resp.status(400).json({error: "Saldo insuficiente"})
    }

    const operacoes = {
        amount,
        created_at: new Date(),
        type: "Debit",
    };

    user.operacoes.push(operacoes);

    return resp.status(201).send("Saque realizado com sucesso")

});

app.get("/saldo", verifyIfExistsAccountCPF, (req,resp) => {
    const {user} = req;

    const saldo = getBalance(user.operacoes);
    
    return resp.status(201).json({"saldo": saldo})
});

app.listen(3333, (erro) => {
    if(erro){
        console.log("Deu ruim!");
    }else{
        console.log("Deu bom!");
    }
});