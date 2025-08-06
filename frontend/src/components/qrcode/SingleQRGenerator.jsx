import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, Download, Loader2Icon } from "lucide-react";
import { generateQRCode, downloadQRCode } from "@/services/apiQRCode";
import { useMutation } from "@tanstack/react-query";
import { saveAs } from "file-saver";

const SingleQRGenerator = ({ onQRGenerated, onQRSelected }) => {
    const [url, setUrl] = useState("");
    const [qrCode, setQrCode] = useState(null);

    const { mutate: generateQR, isPending: isGenerating } = useMutation({
        mutationFn: generateQRCode,
        onSuccess: (data) => {
            console.log(data);
            const qrData = {
                ...data,
                filename: `qr-code-${Date.now()}.png`,
            };
            setQrCode(qrData);
            onQRGenerated?.({ type: "single", data: [qrData] });
        },
        onError: (error) => {
            console.error("Error generating QR code:", error);
        },
    });

    const { mutate: downloadQR, isPending: isDownloading } = useMutation({
        mutationFn: downloadQRCode,
        onSuccess: (blob) => {
            saveAs(blob, qrCode.filename);
        },
        onError: (error) => {
            console.error("Error downloading QR code:", error);
        },
    });

    const handleGenerate = async () => {
        if (!url.trim()) return;
        generateQR({ url });
    };

    const handleQRClick = (qrData) => {
        onQRSelected?.(qrData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Single Link QR Generator
                </CardTitle>
                <CardDescription>
                    Generate QR code from a single URL
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="url">Enter URL</Label>
                    <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={!url.trim() || isGenerating}
                    className="w-full cursor-pointer"
                >
                    {isGenerating ? (
                        <>
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        "Generate QR Code"
                    )}
                </Button>

                {qrCode && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium text-sm text-gray-700">
                            Generated QR Code:
                        </h3>
                        <div className="border rounded-lg p-4 space-y-3">
                            <div
                                className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                                onClick={() => handleQRClick(qrCode)}
                            >
                                <img
                                    src={qrCode.qr_image_url}
                                    alt="Generated QR Code"
                                    className="mx-auto border rounded-lg shadow-sm w-32 h-32 object-contain"
                                />
                                <p className="text-xs text-gray-600 mt-2 break-all">
                                    {qrCode.url}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Click to preview
                                </p>
                            </div>

                            <Button
                                onClick={() => downloadQR(qrCode.id)}
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
                                        <Download className="w-4 h-4 mr-2" />
                                        Download QR Code
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SingleQRGenerator;
