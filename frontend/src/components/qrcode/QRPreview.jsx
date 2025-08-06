import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Eye, Download, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadQRCode } from "@/services/apiQRCode";
import { useMutation } from "@tanstack/react-query";
import { saveAs } from "file-saver";

const QRPreview = ({ selectedQR }) => {

    const { mutate: downloadQR, isPending: isDownloading } = useMutation({
        mutationFn: downloadQRCode,
        onSuccess: (data) => {
            const blob = new Blob([data], { type: "image/png" });
            saveAs(blob, selectedQR.filename);
        },
        onError: (error) => {
            console.error("Error downloading QR code:", error);
        },
    });

    if (!selectedQR) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click on a QR code to preview</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    QR Code Preview
                </CardTitle>
                <CardDescription>QR Code #{selectedQR.idx || selectedQR.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                        <img
                            src={selectedQR.qr_image_url}
                            alt={`QR Code ${selectedQR.id}`}
                            className="w-64 h-64 object-contain"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Original URL:
                        </p>
                        <p className="text-sm text-gray-600 break-all">
                            {selectedQR.url}
                        </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Filename:
                        </p>
                        <p className="text-sm text-gray-600">
                            {selectedQR.filename}
                        </p>
                    </div>
                </div>

                <Button onClick={() => downloadQR(selectedQR.id)} className="w-full cursor-pointer" disabled={isDownloading}>
                    {isDownloading ? (
                        <>
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Download QR Code
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default QRPreview;
