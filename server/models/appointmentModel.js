import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';
import ServiceModel from './service.js';
import { UsersModel } from './model.js';
import BarberService from './barberServices.js';

const AppointmentModel = sequelize.define('AppointmentModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BarberService,
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsersModel,
      key: 'id'
    }
  },
  barberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsersModel,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  },
  clientType: {
    type: DataTypes.ENUM('regular', 'vip', 'premium', 'emergency', 'walk_in'),
    defaultValue: 'regular'
  },
  isReschedule: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Associations remain the same
AppointmentModel.belongsTo(UsersModel, {
  foreignKey: 'clientId',
  as: 'client'
});

AppointmentModel.belongsTo(UsersModel, {
  foreignKey: 'barberId',
  as: 'barber'
});

AppointmentModel.belongsTo(BarberService, {
  foreignKey: 'serviceId',
  as: 'service'
});

export default AppointmentModel;
