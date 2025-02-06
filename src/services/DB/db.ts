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

public async getConsultores(){
  const query = `
  WITH RandomGroups AS (
    SELECT 
        ac.cod_consultor_c,
        RAND() AS random_value
    FROM accounts_cstm ac
    WHERE ac.cod_consultor_c IS NOT NULL AND ac.cod_consultor_c != ''
    GROUP BY ac.cod_consultor_c
)
SELECT
    DENSE_RANK() OVER (ORDER BY rg.random_value) AS 'N°',
    ac.cod_consultor_c as 'Codigo de consultora',
    a.name as 'Razón social',
    a.billing_address_state as 'Departamento / Provincia',
    a.billing_address_city as 'Distrito',
    UPPER(ac.tipo_doc_administrado_c) as 'Tipo de Documento',
    ac.nro_doc_identificacion_c as 'Número de identificacion',
    ea.email_address as 'Correo',
    CASE 
        WHEN ac.status_c = 'active' THEN 'Habilitado'
        WHEN ac.status_c = 'inactive' THEN 'Inhabilitado'
        ELSE 'Desconocido'
    END AS 'Estado de Registro',
    DATE_FORMAT(ac.fecha_presentacion_c, '%d/%m/%Y') AS 'Fecha_Registro',
    c.first_name as 'Nombres',
    c.last_name as 'Apellidos',
    c.title as 'Titulo',
    UPPER(cc.tipo_doc_contac_c ) as 'Tipo de documento',
    cc.doc_ident_contact_c as 'Documento de identidad',
    cc.tuitionnumber_c as 'Número de colegiatura',
    CASE 
        WHEN cc.status_c = 'active' THEN 'Activo'
        WHEN cc.status_c = 'inactive' THEN 'Inactivo'
        ELSE 'Desconocido'
    END AS 'Estado'
FROM accounts a
LEFT JOIN accounts_cstm ac ON ac.id_c = a.id
LEFT JOIN email_addr_bean_rel eabr on eabr.bean_id = a.id and eabr.deleted = 0 and eabr.primary_address = 1
LEFT JOIN email_addresses ea on ea.id = eabr.email_address_id and ea.deleted = 0
RIGHT JOIN accounts_contacts ac2 ON ac2.account_id = a.id and ac2.deleted = 0
RIGHT JOIN contacts c on c.id = ac2.contact_id and c.deleted = 0
LEFT JOIN contacts_cstm cc on cc.id_c = c.id 
LEFT JOIN email_addr_bean_rel eabr2 on eabr2.bean_id = c.id and eabr2.deleted = 0 and eabr2.primary_address = 1
LEFT JOIN email_addresses ea2 on ea2.id = eabr2.email_address_id and ea2.deleted = 0
JOIN RandomGroups rg ON rg.cod_consultor_c = ac.cod_consultor_c
WHERE ac.tipo_administrado_c LIKE '%consultora%' 
AND cc.rol_c LIKE "%consultor%" 
AND a.deleted = 0 
AND ac.status_c != '' 
AND ac.cod_consultor_c != ''
ORDER BY rg.random_value;
`

  const dataConsultores = await tefiDB(query) as ConsultoresInfo[];
  return dataConsultores;
}
}

interface ConsultoresInfo {
  'N°': number;
  'Codigo de consultora': string;
  'Razón social': string;
  'Departamento / Provincia': string;
  Distrito: string;
  'Tipo de Documento': string;
  'Número de identificacion': string;
  Correo: string;
  'Estado de Registro': string;
  Fecha_Registro: string;
  Nombres: string;
  Apellidos: string;
  Titulo: string;
  'Tipo de documento': string;
  'Documento de identidad': string;
  'Número de colegiatura': string;
  Estado: string;
}


// Exportar una instancia de la clase
export const db = Database.getInstance();
