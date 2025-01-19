import { tefiDB } from "../tefiDB";
import mysql from 'mysql';

interface IgaOficioInfo {
  name: string;
  oficio_c: string;
  fecha_oficio_c: string;
  link_oficio_obs_c: string;
  oficio_resol_c: string;
  oficio_resol_fecha_c: null;
  link_oficio_rd_c: string;
}

class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_URL,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      connectionLimit: 10, // Número máximo de conexiones en el pool
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async query(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error al obtener la conexión: ' + err.message);
          reject(err);
          return;
        }

        connection.query(sql, (error, results) => {
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
  public async getOficiosIGA(roadmapList: string[]) {
    const formattedList = roadmapList.map(id => { if (id) { return `'${id}'` } }).join(', ');

    const query = `
    SELECT name, oficio_c, fecha_oficio_c, link_oficio_obs_c, oficio_resol_c, oficio_resol_fecha_c, link_oficio_rd_c 
    FROM iga_igas as iga
    LEFT JOIN iga_igas_cstm as cstm ON cstm.id_c = iga.id 
    WHERE iga.deleted = 0 AND name IN (${formattedList})
    `;
    const dataFitac = await tefiDB(query) as IgaOficioInfo[];

    return dataFitac;
}
}

// Exportar una instancia de la clase
export const db = Database.getInstance();
