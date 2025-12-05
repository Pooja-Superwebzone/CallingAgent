
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Assign2, Assignment } from '@/types';
import { toast } from '@/hooks/use-toast';

interface DeleteAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assign2 | null;
  onConfirm: (id: number) => void;
}

export const DeleteAssignmentDialog: React.FC<DeleteAssignmentDialogProps> = ({
  open,
  onOpenChange,
  assignment,
  onConfirm,
}) => {
  const handleConfirm = async() => {
     
    if (assignment) {
      const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
    const AUTH_KEY =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook/52aa0802-ac10-4e17-b48a-0e5eb1fbdda0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Authorization: AUTH_KEY,
            "Content-Profile": "srtms",
            jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
            session_id: "1",
          },
          body: JSON.stringify(assignment.trip_id),
        }
      );
      console.log(response);

  
      onConfirm(Number(assignment.trip_id));
      toast({
        title: 'Assignment Deleted',
        description: `Assignment "${assignment.driver_name}" has been deleted successfully.`,
        variant: 'destructive',
      });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the assignment "{assignment?.title}"?
            This action cannot be undone and will permanently remove the assignment
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Assignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
