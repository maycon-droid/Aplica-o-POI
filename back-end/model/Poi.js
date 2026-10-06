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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  },
  {
    // Other model options go here
  },
);


Poi.sync();

export default Poi;