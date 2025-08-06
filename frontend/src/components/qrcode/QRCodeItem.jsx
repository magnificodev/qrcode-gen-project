import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { Download } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { downloadQRCode } from "@/services/apiQRCode";
import { saveAs } from "file-saver";

const QRCodeItem = ({ qrData, handleQRClick }) => {
    const { mutate: downloadQR, isPending: isDownloading } = useMutation({
        mutationFn: downloadQRCode,
        onSuccess: (data) => {
            const blob = new Blob([data], { type: "image/png" });
            saveAs(blob, qrData.filename);
        },
        onError: (error) => {
            console.error("Error downloading QR code:", error);
        },
    });
    return (
        <div className="border rounded-lg p-3 space-y-2">
            <div
                className="cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
                onClick={() => handleQRClick(qrData)}
            >
                <img
                    src={qrData.qr_image_url}
                    alt={`QR ${qrData.id}`}
                    className="w-full h-auto mb-1"
                />
                <p className="text-xs text-gray-600 truncate">{qrData.url}</p>
                <p className="text-xs text-blue-600">Click to preview</p>
            </div>
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    downloadQR(qrData.id);
                }}
                variant="outline"
                size="sm"
                className="w-full cursor-pointer"
                disabled={isDownloading}
            >
                {isDownloading ? (
                    <>
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                    </>
                ) : (
                    <>
                        <Download className="w-3 h-3 mr-1" />
                        Download
                    </>
                )}
            </Button>
        </div>
    );
};

export default QRCodeItem;
