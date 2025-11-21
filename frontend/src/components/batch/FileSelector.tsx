import { useRef, useState } from "react";

export const FileSelector = ({ onFilesSelected }: { onFilesSelected: (files: FileList) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    return (
        <div>
            {/* Drag and drop zone */}
            <div
                className={`drag-drop-zone p-4 mb-3 text-center border rounded ${isDragging ? 'bg-light border-primary' : ''}`}
                style={{
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderStyle: 'dashed'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);

                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        onFilesSelected(e.dataTransfer.files);
                    }
                }}
            >
                <div>
                    <i className="bi bi-cloud-upload" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 mb-0">Drag & drop videos here or click to browse</p>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                className="d-none"
                accept="video/*,.360"
                multiple
                ref={fileInputRef}
                onChange={(e) => {
                    if (e.target.files) {
                        onFilesSelected(e.target.files);
                    }
                    // Reset the input value so the same file can be selected again
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }}
            />
        </div>
    );
};
