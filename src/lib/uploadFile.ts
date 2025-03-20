import { toast } from 'sonner';
interface Function {
    [Symbol.metadata]: DecoratorMetadata | null;
}

const uploadFile = async (attachment, uploadDocument) => {
    if (!attachment || attachment.length === 0) {
        // toast.error("No file selected");
        return null;
    }

    try {
        const formData = new FormData();
        formData.append('file', attachment[0]);

        const response = await uploadDocument(formData).unwrap();

        if (!response?.success) {
            throw new Error('File upload failed');
        }

        return response.fileUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        toast.error('File upload failed');
        return null;
    }
};

export default uploadFile;
