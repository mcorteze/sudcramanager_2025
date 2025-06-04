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
    href: "https://apps.powerapps.com/play/e/default-.../a/48675829-d9db-...032f",
    label: "Sistema Tickets",
    icon: PowerAppsLogo,
  },
  {
    href: "https://apps.powerapps.com/play/e/default-.../a/678f662e-2e2a-...1d951",
    label: "Sudcra Upload",
    icon: PowerAppsLogo,
  },
  {
    href: "https://app.powerbi.com/groups/.../reports/...17-7c49-...",
    label: "Monitor planillas",
    icon: PowerBiLogo,
  },
  {
    href: "https://app.powerbi.com/groups/.../reports/...244-0d8a-...",
    label: "Monitor SUDCRA",
    icon: PowerBiLogo,
  },
  {
    href: "https://duoccl0.sharepoint.com/.../imgenes20251/AllItems.aspx",
    label: "Imágenes 2025-1",
    icon: ListLogo,
  },
  {
    href: "https://duoccl0.sharepoint.com/.../planillas_recibidas_2025",
    label: "Planillas recibidas 2025",
    icon: ListLogo,
  },
  {
    href: "https://duoccl0.sharepoint.com/.../Solicitudes_sudcra",
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
