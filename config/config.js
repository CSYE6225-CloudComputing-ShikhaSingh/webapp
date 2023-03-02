
module.exports=
{
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host":process.env.DB_HOSTNAME,
    "dialect": 'postgres',
    "port": "5432"
  },
  "test": {
    "username": "postgres",
    "password": "pgadmin",
    "database": "cloudpostgres",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "port":"5432"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
