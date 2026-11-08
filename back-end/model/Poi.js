import { DataTypes } from "sequelize";
import sequelize from "../database/sequelize.js";


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
      allowNull: false,
      validate: {
        isIn: [['Buraco na via', 'Iluminação pública', 'Acúmulo de lixo', 'Alagamento', 'Esgoto a céu aberto', 'Outros']]
      }
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