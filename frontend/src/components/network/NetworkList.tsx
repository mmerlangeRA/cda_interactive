import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useError } from "../../contexts/ErrorContext";
import { useSuccess } from "../../contexts/SuccessContext";
import { NetworksAPI } from "../../services/api";
import { Network } from "../../types";

interface NetworkListProps {
  onNetworkSelect?: (network: Network | null) => void;
}

const NetworkList: React.FC<NetworkListProps> = ({ onNetworkSelect }) => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetworkUuid, setSelectedNetworkUuid] = useState<string | null>(null);
  const [previouslySelectedNetworkUuid, setPreviouslySelectedNetworkUuid] = useState<string | null>(null);
  const [refreshingNetworks, setRefreshingNetworks] = useState<boolean>(false);
  const { setError } = useError();
  const { setSuccess } = useSuccess();

  const loadNetworks = async () => {
    setRefreshingNetworks(true);
    try {
      const response = await NetworksAPI.getNetworks();
      // Sort networks by created_at in descending order (newest first)
      const sortedNetworks = [...response.data].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Descending order
      });

      setNetworks(sortedNetworks);

      // If no network is selected and we have networks, select the first one
      if (selectedNetworkUuid === null && sortedNetworks.length > 0) {
        setSelectedNetworkUuid(sortedNetworks[0].uuid);
        // Notify parent component if callback is provided
        if (onNetworkSelect) {
          onNetworkSelect(sortedNetworks[0]);
        }
      }
    } catch (error) {
      setError(`Error loading networks:${error}`);
    } finally {
      setRefreshingNetworks(false);
    }
  };

  useEffect(() => {
    loadNetworks();
  }, []);

  useEffect(() => {
    if (selectedNetworkUuid && selectedNetworkUuid != previouslySelectedNetworkUuid) {
      setPreviouslySelectedNetworkUuid(selectedNetworkUuid);
      // Get the selected network to access its slug
      const network = networks.find(n => n.uuid === selectedNetworkUuid);
      if (network) {
        // Notify parent component if callback is provided
        if (onNetworkSelect) {
          onNetworkSelect(network);
        }
      } else if (onNetworkSelect) {
        onNetworkSelect(null);
      }
    }
  }, [selectedNetworkUuid, networks, onNetworkSelect]);

  const handleRefreshNetworks = async () => {
    await loadNetworks();
    setSuccess("Networks list refreshed successfully");
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <span className="text-primary">🌐</span>
          </InputGroup.Text>
          <Form.Select
            id="network-select"
            value={selectedNetworkUuid || ''}
            onChange={(e) => setSelectedNetworkUuid(e.target.value || null)}
            aria-label="Select a network"
          >
            <option value="">Choose a network...</option>
            {networks.map((network) => (
              <option key={network.uuid} value={network.uuid}>
                {network.name}
              </option>
            ))}
          </Form.Select>
          <Button
            variant="outline-secondary"
            onClick={handleRefreshNetworks}
            disabled={refreshingNetworks}
          >
            {refreshingNetworks ? (
              <Spinner animation="border" size="sm" className="me-1" />
            ) : (
              <span>↻</span>
            )}
            {refreshingNetworks ? ' Refreshing...' : ' Refresh'}
          </Button>
        </InputGroup>
      </Form.Group>
    </div>
  );
};

export default NetworkList;
