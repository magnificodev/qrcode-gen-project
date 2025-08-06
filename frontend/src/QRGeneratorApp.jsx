import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SingleQRGenerator from "./components/qrcode/SingleQRGenerator";
import BatchQRGenerator from "./components/qrcode/BatchQRGenerator";
import QRPreview from "./components/qrcode/QRPreview";

const QRGeneratorApp = () => {
    const [currentQRs, setCurrentQRs] = useState(null);
    const [selectedQR, setSelectedQR] = useState(null);

    const handleQRGenerated = (qrData) => {
        setCurrentQRs(qrData);
        // Auto-select first QR code for preview
        if (qrData.data && qrData.data.length > 0) {
            setSelectedQR(qrData.data[0]);
        }
    };

    const handleQRSelected = (qrData) => {
        setSelectedQR(qrData);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        QR Code Generator
                    </h1>
                    <p className="text-gray-600">
                        Generate QR codes from single URLs or batch process
                        Excel files
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Generators */}
                    <div className="space-y-6">
                        <Tabs defaultValue="single" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="single" className="cursor-pointer">
                                    Single URL
                                </TabsTrigger>
                                <TabsTrigger value="batch" className="cursor-pointer">
                                    Batch Excel
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="single" className="space-y-4">
                                <SingleQRGenerator
                                    onQRGenerated={handleQRGenerated}
                                    onQRSelected={handleQRSelected}
                                />
                            </TabsContent>

                            <TabsContent value="batch" className="space-y-4">
                                <BatchQRGenerator
                                    onQRGenerated={handleQRGenerated}
                                    onQRSelected={handleQRSelected}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Preview */}
                    <div>
                        <QRPreview selectedQR={selectedQR} />
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 pt-8 border-t">
                    <p>QR Code Generator - Built with React & shadcn/ui</p>
                </div>
            </div>
        </div>
    );
};

export default QRGeneratorApp;
