import React from "react";
import Modal from "react-bootstrap/Modal";
import { Network, PhotoCollection } from "../../types";
import NetworkDetails from "./NetworkDetails";

interface NetworkDetailsModalProps {
    show: boolean;
    onHide: () => void;
    network: Network;
    photoCollections: PhotoCollection[];
    loadingCollections: boolean;
}

const NetworkDetailsModal: React.FC<NetworkDetailsModalProps> = ({
    show,
    onHide,
    network,
    photoCollections,
    loadingCollections
}) => {
    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Network Details: {network.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <NetworkDetails
                    network={network}
                    photoCollections={photoCollections}
                    loadingCollections={loadingCollections}
                />
            </Modal.Body>
        </Modal>
    );
};

export default NetworkDetailsModal;
