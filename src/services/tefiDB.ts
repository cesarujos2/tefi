import mysql from 'mysql';

const pool = mysql.createPool({
  host: process.env.DB_URL,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10, // Número máximo de conexiones en el pool
});

export async function tefiDB(query: string) {
  return new Promise<any>((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error al obtener la conexión: ' + err.message);
        reject(err);
        return;
      }

      connection.query(query, (error, results) => {
        connection.release(); // Liberar la conexión de vuelta al pool

        if (error) {
          console.error('Error al ejecutar la consulta: ' + error.message);
          reject(error);
          return;
        }

        resolve(results);
      });
    });
  });
}
