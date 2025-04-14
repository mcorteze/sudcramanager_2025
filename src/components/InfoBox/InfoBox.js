// src/components/InfoBox/InfoBox.jsx
import React from 'react';
import { Card, List } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './InfoBox.css';

const InfoBox = ({ items = [] }) => {
  return (
    <Card className="info-box" bordered={false}>
      <div className="info-box-header">
        <InfoCircleOutlined className="info-box-icon" />
        <div className="info-box-title">Información útil</div>
      </div>
      <List
        size="small"
        dataSource={items}
        renderItem={(item) => (
          <List.Item className="info-box-item">
            - {item}
          </List.Item>
        )}
      />
    </Card>
  );
};

export default InfoBox;
