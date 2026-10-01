import React from 'react';
import { ClientDashboard, ClientDashboardProps } from '../ClientDashboard';

export interface ClientDashboardTabProps extends ClientDashboardProps {}

export const ClientDashboardTab: React.FC<ClientDashboardTabProps> = (props) => {
  return <ClientDashboard {...props} />;
};

export { ClientDashboard };

