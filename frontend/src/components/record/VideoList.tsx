import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { VideosAPI } from '../../services/api';
import { Record, Video } from '../../types';
import VideoModal from './VideoModal';

interface VideoListProps {
    videos: Video[];
    onSetMaster: (record: Record, videoId: number) => void;
    record: Record;
    onUrlsRefreshed?: () => void
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const VideoList: React.FC<VideoListProps> = ({ videos, onSetMaster, record, onUrlsRefreshed }) => {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [showModal, setShowModal] = useState(false);
    const refreshVideoUrls = async () => {
        if (videos.length > 0) {
            try {
                // Refresh URLs for all videos
                const refreshPromises = videos.map(video =>
                    VideosAPI.refreshUrl(video.id)
                );

                // Wait for all refresh requests to complete
                await Promise.all(refreshPromises);

                // Call the callback to notify parent component that URLs have been refreshed
                if (onUrlsRefreshed) {
                    onUrlsRefreshed();
                }
            } catch (error) {
                console.error('Error refreshing video URLs:', error);
            }
        }
    };
    const [activeKey, setActiveKey] = useState<string | string[] | null | undefined>(null);

    const handleAccordionChange = (eventKey: string | string[] | null | undefined) => {

        if (eventKey) {
            onAccordionExpand();
        }
        setActiveKey(eventKey);
    };

    const onAccordionExpand = () => {
        refreshVideoUrls()
    };


    const handleViewVideo = (video: Video) => {
        setSelectedVideo(video);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <>
            <Accordion className="mt-4" activeKey={activeKey} onSelect={handleAccordionChange}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        Videos
                        {videos.length > 0 && (
                            <Badge bg="info" className="ms-2">
                                {videos.length}
                            </Badge>
                        )}
                    </Accordion.Header>

                    <Accordion.Body>
                        <Row xs={1} md={2} className="g-3 videos-container">
                            {videos.map(video => (
                                <Col key={video.id}>
                                    <Card border={video.is_master ? 'primary' : ''}>
                                        <Card.Body className="p-2">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center">
                                                    <Form.Check
                                                        type="radio"
                                                        id={`video_${video.id}`}
                                                        name={`masterVideo_${record.id}`}
                                                        checked={video.is_master}
                                                        onChange={() => onSetMaster(record, video.id)}
                                                        className="me-2 mb-0"
                                                    />
                                                    <Card.Title className="mb-0 text-truncate" style={{ maxWidth: '180px', fontSize: '0.9rem' }}>
                                                        {video.title}
                                                    </Card.Title>
                                                </div>
                                                <div className="d-flex">
                                                    {video.is_master && <Badge bg="primary" className="me-1">Master</Badge>}
                                                    <Badge
                                                        bg={video.type === 'PANORAMA' ? 'success' : 'info'}
                                                        className="me-1"
                                                    >
                                                        {video.type}
                                                    </Badge>
                                                    <Badge bg="dark">{formatFileSize(video.size)}</Badge>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewVideo(video)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    as="a"
                                                    href={video.url}
                                                    target="_blank"
                                                    download
                                                >
                                                    ⬇️
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>



            {/* Video Modal */}
            <VideoModal
                show={showModal}
                onHide={handleCloseModal}
                video={selectedVideo}
            />
        </>
    );
};

export default VideoList;
