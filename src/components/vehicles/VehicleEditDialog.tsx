
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VehicleEditForm } from './VehicleEditForm';
import { Vehicle } from '@/types';

interface VehicleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  dataRefresh: () => void;
  vt: any[];
  vm: any[];
  docsType: any[];
  drivers: any[];
}

export const VehicleEditDialog: React.FC<VehicleEditDialogProps> = ({ 
  open, 
  onOpenChange, 
  vehicle,
  dataRefresh,
  vt,
  vm,
  docsType,
  drivers
}) => {
  const handleSubmit = (data: any) => {
    console.log('Vehicle edit form submitted:', data);
    // Here you would normally update the data in your database
    // For now, we'll just log it and close the dialog
    onOpenChange(false);
    dataRefresh();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle - {vehicle.registration_number}</DialogTitle>
        </DialogHeader>
        <VehicleEditForm 
          vehicle={vehicle}
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          vt={vt} 
          vm={vm}
          docsType={docsType} 
          drivers={drivers}
        />
      </DialogContent>
    </Dialog>
  );
};
