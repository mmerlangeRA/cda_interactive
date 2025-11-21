import React, { useState } from 'react';
import { FileEarmarkArrowDown, FileEarmarkCode } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useError } from '../../contexts/ErrorContext';
import { RecordsAPI, VideosAPI } from '../../services/api';
import { Record } from '../../types';
import DownloadComponent from '../DownloadComponent';

interface DownloadForSelectedRecordsProps {
    records: Record[];
}

const DownloadForSelectedRecords: React.FC<DownloadForSelectedRecordsProps> = ({ records }) => {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showL2rModal, setShowL2rModal] = useState(false);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [l2rUrls, setL2rUrls] = useState<string[]>([]);
    const [isGeneratingUrls, setIsGeneratingUrls] = useState(false);
    const [totalVideoSize, setTotalVideoSize] = useState(0);
    const { setError } = useError();
    const l2r_result_suffix = "_result.json";

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleShowVideoModal = async () => {
        setShowVideoModal(true);
        setIsGeneratingUrls(true);

        try {
            // First refresh all video URLs
            const refreshPromises = [];
            for (const record of records) {
                for (const video of record.videos) {
                    refreshPromises.push(VideosAPI.refreshUrl(video.id));
                }
            }

            // Wait for all refresh operations to complete
            await Promise.all(refreshPromises);

            // Now extract all video URLs from the records (with refreshed URLs)
            const urls: string[] = [];
            let totalSize = 0;

            records.forEach(record => {
                record.videos.forEach(video => {
                    if (video.url) {
                        urls.push(video.url);
                        totalSize += video.size;
                    }
                });
            });

            setVideoUrls(urls);
            setTotalVideoSize(totalSize);
        } catch (error) {
            setError(`Error generating video URLs: ${error}`);
        } finally {
            setIsGeneratingUrls(false);
        }
    };

    const handleShowL2rModal = async () => {
        setShowL2rModal(true);
        setIsGeneratingUrls(true);

        try {
            // Get all l2r_result.json files from all records
            const l2rUrlsPromises = records.map(record =>
                RecordsAPI.listBlobDownloadUrlsWithFolders(record.id, 'extracted')
                    .then(response => {
                        const rootUrls: string[] | undefined = response.data.folders["root"];
                        if (!rootUrls) {
                            return [];
                        }
                        const l2rUrls = rootUrls.filter(url => {
                            const urlWithoutParams = url.split('?')[0];
                            return urlWithoutParams.endsWith(l2r_result_suffix);
                        });
                        return l2rUrls;
                    })
            );

            // Wait for all API calls to complete and combine the results
            const urlArrays = await Promise.all(l2rUrlsPromises);
            const combinedUrls = urlArrays.flat();

            setL2rUrls(combinedUrls);
        } catch (error) {
            setError(`Error generating L2R result URLs: ${error}`);
        } finally {
            setIsGeneratingUrls(false);
        }
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
    };

    const handleCloseL2rModal = () => {
        setShowL2rModal(false);
    };

    const getTotalVideoCount = (): number => {
        return records.reduce((count, record) => count + record.videos.length, 0);
    };

    return (
        <div className="download-for-selected-records mb-3">
            <div className="d-flex gap-2">
                <Button
                    variant="primary"
                    onClick={handleShowVideoModal}
                    disabled={getTotalVideoCount() === 0}
                    className="d-flex align-items-center gap-1"
                >
                    <FileEarmarkArrowDown size={16} />
                    Download all videos ({getTotalVideoCount()})
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleShowL2rModal}
                    disabled={records.length === 0}
                    className="d-flex align-items-center gap-1"
                >
                    <FileEarmarkCode size={16} />
                    Download all l2r_results
                </Button>
            </div>

            {/* Modal for downloading videos */}
            <Modal show={showVideoModal} onHide={handleCloseVideoModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Download Videos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isGeneratingUrls ? (
                        <div className="text-center p-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="mt-3">Generating download URLs...</p>
                        </div>
                    ) : (
                        <div>
                            {videoUrls.length > 0 ? (
                                <div>
                                    <p>Ready to download {videoUrls.length} videos from {records.length} records. Total size: {formatFileSize(totalVideoSize)}</p>
                                    <DownloadComponent
                                        name="All Videos"
                                        urls={videoUrls}
                                    />
                                </div>
                            ) : (
                                <p>No videos found in the selected records.</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Modal for downloading L2R results */}
            <Modal show={showL2rModal} onHide={handleCloseL2rModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Download L2R Results</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isGeneratingUrls ? (
                        <div className="text-center p-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="mt-3">Generating download URLs...</p>
                        </div>
                    ) : (
                        <div>
                            {l2rUrls.length > 0 ? (
                                <div>
                                    <p>Ready to download {l2rUrls.length} L2R result files from {records.length} records.</p>
                                    <DownloadComponent
                                        name="All L2R Results"
                                        urls={l2rUrls}
                                    />
                                </div>
                            ) : (
                                <p>No L2R result files found in the selected records.</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseL2rModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DownloadForSelectedRecords;
