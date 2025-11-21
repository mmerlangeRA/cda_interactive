import React from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Video } from '../../types';

interface VideoModalProps {
  show: boolean;
  onHide: () => void;
  video: Video | null;
}

const VideoModal: React.FC<VideoModalProps> = ({ show, onHide, video }) => {
  if (!show || !video) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {video.title}
          {video.is_master && <Badge bg="primary" className="ms-2">Master</Badge>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <video controls className="w-100">
          <source src={video.url} type={video.content_type} />
          Your browser does not support the video tag.
        </video>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary"
          as="a"
          href={video.url}
          target="_blank"
          download
        >
          Download
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VideoModal;
