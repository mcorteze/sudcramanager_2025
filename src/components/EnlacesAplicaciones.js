import React from 'react';
import { Menu } from 'antd';
import PowerAppsLogo from '../images/powerappslogo.png';
import PowerBiLogo from '../images/powerbilogo.png';
import ListLogo from '../images/listlogo.png';

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
};

const iconStyle = (img) => ({
  width: 24,
  height: 24,
  backgroundImage: `url(${img})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  marginRight: 10,
});

const links = [
  {
    href: "https://apps.powerapps.com/play/e/default-72fd0b5a-8a6a-4cff-89f6-bde961f7e250/a/48675829-d9db-4fa7-ab75-8b6d6d2b032f?tenantId=72fd0b5a-8a6a-4cff-89f6-bde961f7e250&hint=c146b3e2-e175-46aa-9931-bd30bd54a870&sourcetime=1720104583100",
    label: "Sistema Tickets",
    icon: PowerAppsLogo,
  },
  {
    href: "https://apps.powerapps.com/play/e/default-72fd0b5a-8a6a-4cff-89f6-bde961f7e250/a/678f662e-2e2a-43da-abef-e7a009a1d951?tenantId=72fd0b5a-8a6a-4cff-89f6-bde961f7e250&hint=f3aa40ef-13fc-4fbd-92bd-622053fd035b&sourcetime=1720104629264",
    label: "Sudcra Upload",
    icon: PowerAppsLogo,
  },
  {
    href: "https://app.powerbi.com/groups/530c4e63-77c1-4129-a317-088008da3b84/reports/26e99117-7c49-43b4-af77-aa357c5d8dbe?experience=power-bi",
    label: "Monitor planillas",
    icon: PowerBiLogo,
  },
  {
    href: "https://app.powerbi.com/groups/530c4e63-77c1-4129-a317-088008da3b84/reports/9c33f244-0d8a-46f1-a9a9-8009d894abb7/6e316e19d1c27603d315?experience=power-bi",
    label: "Monitor SUDCRA",
    icon: PowerBiLogo,
  },
  {
    href: "https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/imgenes20251/AllItems.aspx?sortField=ID&isAscending=false&viewid=62f72397-1211-4bc9-a7ca-7ecc0094a11e&env=WebViewList",
    label: "Imágenes 2025-1",
    icon: ListLogo,
  },
  {
    href: "https://duoccl0.sharepoint.com/sites/SUDCRA1.5/Lists/planillas_recibidas_2025/AllItems.aspx?env=WebViewList",
    label: "Planillas recibidas 2025",
    icon: ListLogo,
  },
  {
    href: "https://duoccl0.sharepoint.com/sites/SUDCRA2/Lists/Solicitudes_sudcra/AllItems.aspx?env=WebViewList",
    label: "Solicitudes (tickets)",
    icon: ListLogo,
  },
];

const EnlacesAplicaciones = () => (
  <Menu>
    {links.map(({ href, label, icon }) => (
      <Menu.Item key={label}>
        <a href={href} target="_blank" rel="noopener noreferrer" style={menuItemStyle}>
          <div style={iconStyle(icon)} />
          {label}
        </a>
      </Menu.Item>
    ))}
  </Menu>
);

export default EnlacesAplicaciones;
