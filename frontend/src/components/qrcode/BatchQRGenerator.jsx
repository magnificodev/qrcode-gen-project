import { useState, useRef } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    FileText,
    Upload,
    ArrowLeft,
    Download,
    Loader2Icon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { generateBatchQRCode, downloadBatchQRCode } from "@/services/apiQRCode";
import { saveAs } from "file-saver";
import { useMutation } from "@tanstack/react-query";
import QRCodeItem from "./QRCodeItem";

const BatchQRGenerator = ({ onQRGenerated, onQRSelected }) => {
    const [file, setFile] = useState(null);
    const [qrCodes, setQrCodes] = useState([]);
    const [batchData, setBatchData] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const { mutate: generateBatchQR, isPending: isGenerating } = useMutation({
        mutationFn: generateBatchQRCode,
        onSuccess: (data) => {
            const generatedQRs = data.items.map((qr, index) => ({
                ...qr,
                idx: index + 1,
                filename: `qr-code-${index + 1}.png`,
            }));
            setQrCodes(generatedQRs);
            setBatchData(data);
            onQRGenerated?.({ type: "batch", data: generatedQRs });
        },
        onError: (error) => {
            console.error("Error generating batch QR codes:", error);
        },
    });

    const { mutate: downloadBatchQR, isPending: isDownloading } = useMutation({
        mutationFn: downloadBatchQRCode,
        onSuccess: (blob) => {
            // const blob = new Blob([data], { type: "application/zip" });
            saveAs(blob, "batch-qr-codes.zip");
        },
        onError: (error) => {
            console.error("Error downloading QR code:", error);
        },
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (
                selectedFile.type !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
                selectedFile.type !== "application/vnd.ms-excel"
            ) {
                setError("Please select a valid Excel file (.xlsx or .xls)");
                return;
            }
            setFile(selectedFile);
            setError("");
            setQrCodes([]); // Reset QR codes when new file is selected
        }
    };

    const handleGenerate = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        generateBatchQR(formData);
    };

    const handleQRClick = (qrData) => {
        onQRSelected?.(qrData);
    };

    const resetFile = () => {
        setFile(null);
        setQrCodes([]);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Batch QR Generator
                </CardTitle>
                <CardDescription>
                    Generate multiple QR codes from Excel file
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!file ? (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                                Upload Excel file with URLs in the first column
                            </p>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="cursor-pointer"
                            >
                                Choose Excel File
                            </Button>
                        </div>

                        <Alert>
                            <AlertDescription>
                                Excel file should have URLs in the first column.
                                The first row will be treated as a header and
                                skipped.
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {file.name}
                                </span>
                                <Badge variant="secondary">
                                    {(file.size / 1024).toFixed(1)} KB
                                </Badge>
                            </div>
                            <Button
                                onClick={resetFile}
                                variant="ghost"
                                size="sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </div>

                        {qrCodes?.length === 0 && (
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full cursor-pointer"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate QR Codes"
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {qrCodes.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm text-gray-700">
                                Generated {qrCodes.length} QR codes:
                            </h3>
                            <Button
                                onClick={() => downloadBatchQR(batchData.id)}
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download All
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                            {qrCodes.map((qr) => (
                                <QRCodeItem
                                    key={qr.id}
                                    qrData={qr}
                                    handleQRClick={handleQRClick}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BatchQRGenerator;
