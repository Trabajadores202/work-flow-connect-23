
const { Sequelize } = require('sequelize');

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true
    },
    // Prevenir errores de conexión
    dialectOptions: {
      connectTimeout: 60000
    }
  }
);

// Función para probar la conexión y crear la base de datos si no existe
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    return false;
  }
}

async function syncModels(force = false) {
  try {
    await sequelize.sync({ force });
    console.log(`Modelos sincronizados ${force ? '(tablas recreadas)' : '(estructura actualizada)'}`);
    return true;
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncModels
};
