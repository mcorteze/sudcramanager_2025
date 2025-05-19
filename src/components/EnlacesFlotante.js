import React from 'react';
import PowerAppsLogo from '../images/powerappslogo.png';
import PowerBiLogo from '../images/powerbilogo.png';
import ListLogo from '../images/listlogo.png';
import './EnlacesFlotante.css';

export default function EnlacesFlotante() {
  return (
    <div className='sidebar'>
      <div className='sidebar-links'>
        {/* PowerApps */}
        <a href="https://apps.powerapps.com/play/e/default-72fd0b5a-8a6a-4cff-89f6-bde961f7e250/a/48675829-d9db-4fa7-ab75-8b6d6d2b032f?tenantId=72fd0b5a-8a6a-4cff-89f6-bde961f7e250&hint=c146b3e2-e175-46aa-9931-bd30bd54a870&sourcetime=1720104583100" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${PowerAppsLogo})` }}></div>
          <span>Sistema Tickets</span>
        </a>
        <a href="https://apps.powerapps.com/play/e/default-72fd0b5a-8a6a-4cff-89f6-bde961f7e250/a/678f662e-2e2a-43da-abef-e7a009a1d951?tenantId=72fd0b5a-8a6a-4cff-89f6-bde961f7e250&hint=f3aa40ef-13fc-4fbd-92bd-622053fd035b&sourcetime=1720104629264" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${PowerAppsLogo})` }}></div>
          <span>Sudcra Upload</span>
        </a>
        {/* PowerBi */}
        <a href="https://app.powerbi.com/groups/530c4e63-77c1-4129-a317-088008da3b84/reports/26e99117-7c49-43b4-af77-aa357c5d8dbe?experience=power-bi" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${PowerBiLogo})` }}></div>
          <span>Monitor planillas</span>
        </a>
        <a href="https://app.powerbi.com/groups/530c4e63-77c1-4129-a317-088008da3b84/reports/9c33f244-0d8a-46f1-a9a9-8009d894abb7/6e316e19d1c27603d315?experience=power-bi" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${PowerBiLogo})` }}></div>
          <span>Monitor SUDCRA</span>
        </a>
        {/* List */}
        <a href="https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/imgenes20251/AllItems.aspx?sortField=ID&isAscending=false&viewid=62f72397-1211-4bc9-a7ca-7ecc0094a11e&env=WebViewList" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${ListLogo})` }}></div>
          <span>Imágenes 2025-1</span>
        </a>
        <a href="https://duoccl0.sharepoint.com/sites/SUDCRA1.5/Lists/planillas_recibidas_2025/AllItems.aspx?env=WebViewList" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${ListLogo})` }}></div>
          <span>Planillas recibidas 2025</span>
        </a>
        <a href="https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/Solicitudes_sudcra/AllItems.aspx?env=WebViewList" target="_blank" rel="noopener noreferrer" className='sidebar-link'>
          <div className='sidebar-icon' style={{ backgroundImage: `url(${ListLogo})` }}></div>
          <span>Solicitudes (tickets)</span>
        </a>
      </div>
    </div>
  );
}
