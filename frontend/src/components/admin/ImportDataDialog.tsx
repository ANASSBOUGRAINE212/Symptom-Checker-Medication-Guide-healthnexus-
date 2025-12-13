import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, AlertCircle, CheckCircle2 } from "lucide-react";

interface ImportResult {
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
  totalProcessed: number;
}

interface ImportDataDialogProps {
  onImportComplete?: () => void;
}

export function ImportDataDialog({ onImportComplete }: ImportDataDialogProps) {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [dataType, setDataType] = useState<"diseases" | "medications">("diseases");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [".csv", ".json"];
      const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or JSON file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setUploadProgress(30);

      const endpoint = dataType === "diseases" 
        ? "/diseases/import/csv" 
        : "/medications/import/csv";

      const response = await fetch(`http://localhost:5174/api${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Import failed" }));
        throw new Error(errorData.error || "Import failed");
      }

      const result: ImportResult = await response.json();
      setImportResult(result);
      setUploadProgress(100);

      toast({
        title: "Import completed",
        description: `Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors.length}`,
      });

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      const endpoint = dataType === "diseases" 
        ? "/diseases/export/csv" 
        : "/medications/export/csv";

      const response = await fetch(`http://localhost:5174/api${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataType}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: `${dataType} data exported successfully`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = dataType === "diseases"
      ? `name,category,categories,severity,definition,symptoms,causes,testsAndProcedures,medications,treatments,prevention,prognosis,prevalence
"Example Disease","Infectious Diseases","Viral Diseases|Respiratory Diseases","moderate","A description of the disease","Fever|Cough|Fatigue","Virus|Bacteria","Blood test|X-ray","Medicine A|Medicine B","Rest|Fluids","Vaccination|Hygiene","Good with treatment","Common worldwide"`
      : `name,purpose,disease,sideEffects,dosage,contraindications,interactions,howItWorks,whenToTake,warnings,category,categories
"Example Medicine","Treats pain and fever","Headache|Fever","Nausea|Dizziness","500mg every 6 hours|1000mg every 8 hours","Liver disease|Allergy","Blood thinners|Alcohol","Blocks pain signals","With food","Do not exceed recommended dose","Pain Relief","Analgesics|Antipyretics"`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataType}-template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setImportResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import / Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import / Export Data</DialogTitle>
          <DialogDescription>
            Import data from CSV or JSON files, or export existing data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Data Type</Label>
            <Select value={dataType} onValueChange={(v) => setDataType(v as "diseases" | "medications")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diseases">Diseases</SelectItem>
                <SelectItem value="medications">Medications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upload File (CSV or JSON)</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="flex-1"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Importing... {uploadProgress}%
              </p>
            </div>
          )}

          {importResult && (
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Import Complete
              </h4>
              <div className="text-sm space-y-1">
                <p className="text-green-600">Created: {importResult.created}</p>
                <p className="text-blue-600">Updated: {importResult.updated}</p>
                <p className="text-gray-600">Total processed: {importResult.totalProcessed}</p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Errors: {importResult.errors.length}
                    </p>
                    <div className="max-h-32 overflow-y-auto mt-1 text-xs bg-red-50 p-2 rounded">
                      {importResult.errors.slice(0, 10).map((err, i) => (
                        <p key={i} className="text-red-700">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                      {importResult.errors.length > 10 && (
                        <p className="text-red-500">...and {importResult.errors.length - 10} more errors</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">CSV Format Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use <code className="bg-background px-1 rounded">|</code> (pipe) to separate multiple values</li>
              <li>Example: <code className="bg-background px-1 rounded">Fever|Cough|Headache</code></li>
              <li>Existing entries with same name will be updated</li>
              <li>Download the template for the correct format</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
