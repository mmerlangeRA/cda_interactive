import React from "react";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { Network, PhotoCollection } from "../../types";

interface NetworkDetailsProps {
  network: Network;
  photoCollections: PhotoCollection[];
  loadingCollections: boolean;
}

const NetworkDetails: React.FC<NetworkDetailsProps> = ({
  network,
  photoCollections,
  loadingCollections
}) => {
  return (
    <div className="p-3">
      <Row>
        <Col md={6}>
          <Card bg="light" className="mb-3">
            <Card.Header>Basic Information</Card.Header>
            <Card.Body>
              <p><strong>Full Name:</strong> {network.name_long}</p>
              <p><strong>Country:</strong> {network.country}</p>
              <p><strong>Role:</strong> {network.role}</p>
              <p><strong>Length:</strong> {network.length}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card bg="light" className="mb-3">
            <Card.Header>Technical Details</Card.Header>
            <Card.Body>
              <p><strong>UUID:</strong> <code>{network.uuid}</code></p>
              <p><strong>Slug:</strong> <code>{network.slug}</code></p>
              <p><strong>Created:</strong> {new Date(network.created_at).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(network.updated_at).toLocaleString()}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {network.bounding_box && Object.keys(network.bounding_box).length > 0 && (
        <Card bg="light" className="mb-3">
          <Card.Header>Bounding Box</Card.Header>
          <Card.Body>
            <pre className="mb-0"><code>{JSON.stringify(network.bounding_box, null, 2)}</code></pre>
          </Card.Body>
        </Card>
      )}

      {network.modules && network.modules.length > 0 && (
        <Card bg="light" className="mb-3">
          <Card.Header>Modules</Card.Header>
          <Card.Body>
            <pre className="mb-0"><code>{JSON.stringify(network.modules, null, 2)}</code></pre>
          </Card.Body>
        </Card>
      )}

      {/* Photo Collections */}
      <Card bg="light" className="mb-3">
        <Card.Header>Photo Collections</Card.Header>
        <Card.Body>
          {loadingCollections ? (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Loading collections...</span>
            </div>
          ) : photoCollections.length > 0 ? (
            <div className="table-responsive">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Layer</th>
                    <th>UUID</th>
                  </tr>
                </thead>
                <tbody>
                  {photoCollections.map((collection, index) => (
                    <tr key={index}>
                      <td>
                        <Badge bg={collection.type === 'PANORAMA' ? 'success' : 'primary'}>
                          {collection.type}
                        </Badge>
                      </td>
                      <td>{new Date(collection.date).toLocaleDateString()}</td>
                      <td>{collection.layer}</td>
                      <td><code className="small">{collection.uuid}</code></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted mb-0">No photo collections available for this network.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default NetworkDetails;
