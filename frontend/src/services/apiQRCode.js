import http from "./httpClient"

const generateQRCode = async (data) => {
    const response = await http.post("/qrcode", data)
    return response.data
}

const generateBatchQRCode = async (data) => {
    const response = await http.post("/qrcode/batch", data)
    return response.data
}

const downloadQRCode = async (id) => {
    const response = await http.get(`/qrcode/${id}/download`, {
        responseType: "blob",
    })
    return response.data
}

const downloadBatchQRCode = async (id) => {
    const response = await http.get(`/qrcode/batch/${id}/download`, {
        responseType: "blob",
    })
    return response.data
}

export { generateQRCode, generateBatchQRCode, downloadQRCode, downloadBatchQRCode }