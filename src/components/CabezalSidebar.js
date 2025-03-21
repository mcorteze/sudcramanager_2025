import React from 'react';
import './CabezalSidebar.css'
import { MdOutlineSupportAgent } from "react-icons/md";

export default function CabezalSidebar () {
  return (
    <div className='cabezal-sidebar cabezal-icon'>
        <MdOutlineSupportAgent />
        <span>Sudcra Manager 2025</span>
    </div>
  );
};