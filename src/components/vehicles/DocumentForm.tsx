
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

export interface DocumentFormData {
  id: string;
  document_type: string;
  effective_date: string;
  expiration_date: string;
  files: File[];
}

interface DocumentFormProps {
  document: DocumentFormData;
  index: number;
  onUpdate: (index: number, field: keyof DocumentFormData, value: string | File[]) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

const documentTypes = [
  'Registration Certificate',
  'Insurance Policy', 
  'Fitness Certificate',
  'Permit',
  'Tax Receipt',
  'Pollution Certificate',
  'Driver License',
  'Vehicle RC',
  'Other'
];

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  index,
  onUpdate,
  onRemove,
  showRemove
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onUpdate(index, 'files', [...document.files, ...files]);
  };

  const removeFile = (fileIndex: number) => {
    const updatedFiles = document.files.filter((_, i) => i !== fileIndex);
    onUpdate(index, 'files', updatedFiles);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Document {index + 1}</h4>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`document_type_${index}`}>Document Type</Label>
          <Select
            value={document.document_type}
            onValueChange={(value) => onUpdate(index, 'document_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`effective_date_${index}`}>Effective Date</Label>
          <Input
            id={`effective_date_${index}`}
            type="date"
            value={document.effective_date}
            onChange={(e) => onUpdate(index, 'effective_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`expiration_date_${index}`}>Expiration Date</Label>
          <Input
            id={`expiration_date_${index}`}
            type="date"
            value={document.expiration_date}
            onChange={(e) => onUpdate(index, 'expiration_date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`document_upload_${index}`}>Upload Documents</Label>
        <Input
          id={`document_upload_${index}`}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          multiple
          className="flex-1"
        />
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
        </p>
        
        {document.files.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Uploaded Files:</h5>
            <div className="space-y-2">
              {document.files.map((file, fileIndex) => (
                <div key={fileIndex} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
