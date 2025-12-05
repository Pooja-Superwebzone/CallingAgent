
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VehicleForm } from './VehicleForm';

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vt: any[];
  vm: any[];
  docsType: any[];
  drivers: any[];
}

export const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({ open, onOpenChange, vt, vm, docsType, drivers }) => {
  const handleSubmit = (data: any) => {
    console.log('Vehicle form data ready to sybmit:', data);
    // Here you would normally save the data to your database
    // For now, we'll just log it and close the dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        <VehicleForm onSubmit={handleSubmit} onCancel={handleCancel} vt={vt} vm={vm} docsType={docsType} drivers={drivers} />
      </DialogContent>
    </Dialog>
  );
};
