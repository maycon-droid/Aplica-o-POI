import { DataTypes } from "sequelize";
import sequelize from "./database/sequelize.js";


const Poi = sequelize.define(
  'Poi',
  {
    // Model attributes are defined here
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    tipo: {
      type: DataTypes.STRING,
      enum: ['Educação' , 'Lazer', 'Saúde', 'Trabalho']
    },
    localizacao: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true
    }
  },
  {
    // Other model options go here
  },
);

// `sequelize.define` also returns the model
console.log(User === sequelize.models.User); // true

User.sync();

User.create({
  firstName: 'Maycon',
  lastName: 'Silva',
  email: 'maycon@email.com'
}). then(user => {
  console.log('Criado com sucesso');
}).catch(error => {
  console.log('Erro ao criar')
})

User.create({
  firstName: 'Billie',
  lastName: 'Eilish',
  email: 'billieeilish@email.com'
}). then(user => {
  console.log('Criado com sucesso');
}).catch(error => {
  console.log('Erro ao criar')
})