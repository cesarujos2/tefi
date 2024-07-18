import { tefiDB } from "./tefiDB";

export async function getFitac(roadmap: string) {
    const query = `
    SELECT 
    ficha.document_name, 
    ficha.id, 
    ficha.status_id, 
    ficha_cstm.tipo_expediente_c, 
    accounts_cstm.nro_doc_identificacion_c, 
    contacts.first_name AS first_name,
    contacts.last_name AS last_name,
    proyectos.document_name as nameProyect,
    GROUP_CONCAT(emails.email_address SEPARATOR ', ') AS emails_concat
FROM 
    fitac_fitac AS ficha
LEFT JOIN 
    fitac_fitac_cstm AS ficha_cstm ON ficha.id = ficha_cstm.id_c
LEFT JOIN 
    fitac_fitac_proy_proyectostele_c AS enlace ON ficha.id = enlace.fitac_fitac_proy_proyectostelefitac_fitac_idb AND enlace.deleted = 0
LEFT JOIN 
    proy_proyectostele AS proyectos ON proyectos.id = enlace.fitac_fitac_proy_proyectosteleproy_proyectostele_ida AND proyectos.deleted = 0
LEFT JOIN 
    proy_proyectostele_accounts_c AS enlace_ac ON proyectos.id = enlace_ac.proy_proyectostele_accountsproy_proyectostele_idb AND enlace_ac.deleted = 0
LEFT JOIN 
    accounts ON enlace_ac.proy_proyectostele_accountsaccounts_ida = accounts.id AND accounts.deleted = 0
LEFT JOIN 
    accounts_cstm ON accounts_cstm.id_c = accounts.id
LEFT JOIN 
    fitac_fitac_contacts_c AS enlace_contacts ON ficha.id = enlace_contacts.fitac_fitac_contactsfitac_fitac_idb AND enlace_contacts.deleted = 0
LEFT JOIN 
    contacts ON enlace_contacts.fitac_fitac_contactscontacts_ida = contacts.id AND contacts.deleted = 0
RIGHT JOIN 
    email_addr_bean_rel AS enlace_emails ON enlace_emails.bean_id = contacts.id AND enlace_emails.deleted = 0
LEFT JOIN 
    email_addresses AS emails ON emails.id = enlace_emails.email_address_id
WHERE 
    ficha.document_name = '${roadmap}' 
    AND ficha.deleted = 0
GROUP BY 
    ficha.id, 
    ficha.status_id, 
    ficha_cstm.tipo_expediente_c, 
    accounts_cstm.nro_doc_identificacion_c, 
    contacts.first_name,
    contacts.last_name,
    proyectos.document_name;`

    const dataFitac = await tefiDB(query);

    return dataFitac

}