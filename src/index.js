const express = require('express');
const {v4: uuid4 } = require('uuid')

const app = express();

app.use(express.json());

const dados = []

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
        statement: []
    });
    return resp.status(201).send("Usuário cadastrado com sucesso");
})

app.listen(3333, (erro) => {
    if(erro){
        console.log("Deu ruim!");
    }else{
        console.log("Deu bom!");
    }
})