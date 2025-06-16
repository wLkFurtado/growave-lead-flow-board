
import React from 'react';
import { DashboardProvider } from './DashboardProvider';
import { DashboardLayout } from './DashboardLayout';

export const DashboardContent = () => {
  return (
    <DashboardProvider>
      {(props) => <DashboardLayout {...props} />}
    </DashboardProvider>
  );
};
