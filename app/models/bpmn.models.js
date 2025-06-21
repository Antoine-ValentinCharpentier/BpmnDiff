import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const BpmnFile = sequelize.define('BpmnFile', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  nameBpmnBefore: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameBpmnAfter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bpmn_files',
  updatedAt: false
});

export default BpmnFile;
