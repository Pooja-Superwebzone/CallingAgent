
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InventoryItem } from "@/types";
import { toast } from "sonner";

interface DeleteInventoryDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteInventoryDialog: React.FC<DeleteInventoryDialogProps> = ({
  item,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  if (!item) return null;
  const handleConfirm = async () => {
    if (item) {
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
          body: JSON.stringify(item.id),
        }
      );
      console.log(response);

      onConfirm();
      toast(`Assignment "${item.id}" has been deleted successfully.`);
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{item.name}"? This action cannot be
            undone.
            <br />
            <br />
            <strong>Item Details:</strong>
            <br />
            Category: {item.category}
            <br />
            Current Quantity: {item.quantity} {item.unit}
            <br />
            Location: {item.location}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Item"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
