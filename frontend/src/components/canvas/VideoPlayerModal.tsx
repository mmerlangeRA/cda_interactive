import React, { useRef } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Fullscreen } from 'react-bootstrap-icons';

interface VideoPlayerModalProps {
  show: boolean;
  onHide: () => void;
  videoUrl: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  description?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  show,
  onHide,
  videoUrl,
  autoplay = false,
  loop = false,
  muted = true,
  description = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Video Player</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {description && (
          <div className="mb-3">
            <p className="text-muted">{description}</p>
          </div>
        )}
        <div className="position-relative" style={{ backgroundColor: '#000' }}>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            style={{
              width: '100%',
              maxHeight: '70vh',
              display: 'block',
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleFullscreen}>
          <Fullscreen size={16} className="me-2" />
          Fullscreen
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
