import React from 'react';
import { AgencyClientPortal, PortalTab } from './AgencyClientPortal';

interface AdminPortalProps {
  onBackToBuilder: () => void;
  onBackToLanding: () => void;
  projectTitle?: string;
  blockCount?: number;
  initialTab?: PortalTab;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToBuilder,
  onBackToLanding,
  projectTitle = 'CloudboyX Business Website',
  blockCount = 6,
  initialTab,
}) => {
  return (
    <AgencyClientPortal
      projectTitle={projectTitle}
      blockCount={blockCount}
      initialTab={initialTab}
      onBackToBuilder={onBackToBuilder}
      onBackToLanding={onBackToLanding}
    />
  );
};
