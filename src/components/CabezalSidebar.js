import React from 'react'; 
import './CabezalSidebar.css'
import { MdOutlineSupportAgent } from "react-icons/md";
import { Link } from 'react-router-dom';

export default function CabezalSidebar () {
  return (
    <Link to="/monitoreo_inicio" className='cabezal-sidebar-link'>
      <div className='cabezal-sidebar cabezal-icon'>
        <MdOutlineSupportAgent />
        <span>Sudcra Manager 2025</span>
        <span className='descripcion'>Asistente de monitoreo y apoyo operativo</span>
      </div>
    </Link>
  );
};
