import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadComboFile } from '@/service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function DropBox() {
    const { user } = useAppSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<{ created: any[]; errors: any[] } | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setResult(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadComboFile(Number(user?.id), file);
            if (res.status === 201 || res.status === 200) {
                toast.success(res.message || 'Upload successful');
                setResult(res.data);

                queryClient.invalidateQueries({ queryKey: ['combos'] });
                setTimeout(() => setOpen(false), 2000);
            } else {
                toast.error(res.message || 'Upload failed');
                setResult(res.data);
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setResult(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-green-700 text-white">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Combos</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file with the combo data. The file must contain these columns: name, matric_number, email, certNo, type, year, remark, session, print_date.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Supports .xlsx, .xls, .csv</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <File className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={removeFile} disabled={uploading}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`rounded-lg p-4 ${result.errors.length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                            <div className="flex items-start gap-3">
                                {result.errors.length > 0 ? (
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                ) : (
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                )}
                                <div>
                                    <p className={`font-medium ${result.errors.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                                        {result.created.length} created, {result.errors.length} failed
                                    </p>
                                    {result.errors.length > 0 && (
                                        <details className="mt-2">
                                            <summary className="text-sm cursor-pointer text-red-600">View errors</summary>
                                            <ul className="mt-2 text-xs space-y-1 list-disc pl-4">
                                                {result.errors.map((err, i) => (
                                                    <li key={i}>{err.error || JSON.stringify(err)}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={!file || uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}