import { useParams } from "react-router-dom";
import { useState } from "react";
import { Typography, Divider } from "antd";

import MatriculaEvalList from "../components/BuscarArchivoLeido/MatriculaEvalList";
import ItemRespList from "../components/BuscarArchivoLeido/ItemRespList";
import ItemResp2List from "../components/BuscarArchivoLeido/ItemResp2List";

const { Title } = Typography;

export default function BuscarArchivoLeidoPage() {
  const { id_archivo_leido } = useParams();

  const [selectedMatricula, setSelectedMatricula] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={4}>Buscar Archivo Leído</Title>

      {id_archivo_leido && (
        <>
          <MatriculaEvalList
            id_archivo_leido={id_archivo_leido}
            onSelect={setSelectedMatricula}
          />
          <Divider />
          <Title level={4}>Matricula Eval Item Resp</Title>
          {selectedMatricula && (
            <>
              <ItemRespList id_matricula_eval={selectedMatricula} />
              <Divider />
              <Title level={4}>Matricula Eval Item Resp2</Title>
              <ItemResp2List id_matricula_eval={selectedMatricula} />
            </>
          )}
        </>
      )}
    </div>
  );
}
