interface Fitac {
  result_count: number;
  total_count: string;
  next_offset: number;
  entry_list: Entrylist[];
  relationship_list: any[];
}

interface Entrylist {
  id: string;
  module_name: string;
  name_value_list: Namevaluelist;
}

interface Namevaluelist {
  assigned_user_name: Assignedusername;
  modified_by_name: Assignedusername;
  created_by_name: Assignedusername;
  id: Assignedusername;
  name: Assignedusername;
  date_entered: Assignedusername;
  date_modified: Assignedusername;
  modified_user_id: Assignedusername;
  created_by: Assignedusername;
  description: Assignedusername;
  deleted: Assignedusername;
  assigned_user_id: Assignedusername;
  document_name: Assignedusername;
  filename: Assignedusername;
  file_ext: Assignedusername;
  file_mime_type: Assignedusername;
  uploadfile: Assignedusername;
  active_date: Assignedusername;
  exp_date: Assignedusername;
  category_id: Assignedusername;
  subcategory_id: Assignedusername;
  status_id: Assignedusername;
  status: Assignedusername;
  show_preview: Assignedusername;
  foto_montaje: Assignedusername;
  fitac_fitac_contacts_name: Assignedusername;
  nro_oficio_rep_c: Assignedusername;
  fitac_fitac_proy_proyectostele_name: Assignedusername;
  link_fitac_c: Assignedusername;
  fecha_ingreso_c: Assignedusername;
  fitac_v7_c: Assignedusername;
  fitac_v5_c: Assignedusername;
  hr_inicial_c: Assignedusername;
  fitac_v2_c: Assignedusername;
  fitac_v15_c: Assignedusername;
  copias_c: Assignedusername;
  fitac_v14_c: Assignedusername;
  fecha_oficio_c: Assignedusername;
  fitac_v4_c: Assignedusername;
  tipo_expediente_c: Assignedusername;
  link_oficio_c: Assignedusername;
  fitac_v1_c: Assignedusername;
  account_id_c: Assignedusername;
  fitac_v8_c: Assignedusername;
  fitac_v3_c: Assignedusername;
  fitac_v12_c: Assignedusername;
  fitac_v10_c: Assignedusername;
  fitac_v13_c: Assignedusername;
  fitac_v9_c: Assignedusername;
  hoja_envio_c: Assignedusername;
  orden_pedido_c: Assignedusername;
  parrafo_no_conforme_c: Assignedusername;
  link_rni_c: Assignedusername;
  fitac_v6_c: Assignedusername;
  fitac_v11_c: Assignedusername;
  copia_muni_c: Assignedusername;
  link_seia_c: Assignedusername;
}

interface Assignedusername {
  name: string;
  value: string;
}