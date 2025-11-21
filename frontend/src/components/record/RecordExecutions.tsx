import React, { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import { RecordsAPI } from '../../services/api';
import { Execution, Task } from '../../types';

interface RecordExecutionsProps {
  executions: Execution[];
}

const RecordExecutions: React.FC<RecordExecutionsProps> = ({ executions }) => {
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to get the status badge color
  const getStatusBadgeVariant = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success';
      case 'running':
      case 'started':
        return 'primary';
      case 'error':
        return 'danger';
      case 'waiting':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Function to format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Function to refresh execution data
  const refreshExecution = async () => {
    if (!selectedExecution) return;

    try {
      setLoading(true);
      const response = await RecordsAPI.getExecutionDetails(selectedExecution.id);
      setSelectedExecution(response.data);
    } catch (error) {
      console.error('Error refreshing execution:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up refresh interval when an execution is selected
  useEffect(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    // If an execution is selected, set up a new interval
    if (selectedExecution) {
      // Initial fetch
      refreshExecution();

      // Set up interval for subsequent fetches (every 60 seconds)
      const interval = setInterval(refreshExecution, 60000);
      setRefreshInterval(interval);
    }

    // Clean up interval on unmount or when selected execution changes
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [selectedExecution?.id]);

  // Handle execution selection
  const handleSelectExecution = (execution: Execution) => {
    setSelectedExecution(execution);
  };

  return (
    <Accordion className="mt-4">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          Executions
          {executions.length > 0 && (
            <Badge bg="info" className="ms-2">
              {executions.length}
            </Badge>
          )}
        </Accordion.Header>
        <Accordion.Body>
          {executions.length === 0 ? (
            <p className="text-muted">No executions found for this record.</p>
          ) : (
            <div className="row">
              <div className="col-md-4">
                <Card>
                  <Card.Header>Execution List</Card.Header>
                  <ListGroup variant="flush">
                    {executions.map((execution) => (
                      <ListGroup.Item
                        key={execution.id}
                        action
                        active={selectedExecution?.id === execution.id}
                        onClick={() => handleSelectExecution(execution)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div>Execution {execution.type} #{execution.id}</div>
                          <small className="text-muted">
                            {formatDate(execution.start_date)}
                          </small>
                        </div>
                        <Badge bg={getStatusBadgeVariant(execution.status)}>
                          {execution.status}
                        </Badge>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              </div>
              <div className="col-md-8">
                {selectedExecution ? (
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        Execution Details #{selectedExecution.id}
                        <Badge
                          bg={getStatusBadgeVariant(selectedExecution.status)}
                          className="ms-2"
                        >
                          {selectedExecution.status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={refreshExecution}
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'Refresh'
                        )}
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong>Started:</strong> {formatDate(selectedExecution.start_date)}
                        <br />
                        <strong>Ended:</strong> {formatDate(selectedExecution.end_date)}
                      </div>

                      <h6>Tasks</h6>
                      {selectedExecution.tasks && selectedExecution.tasks.length > 0 ? (
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Status</th>
                              <th>Custom Status</th>
                              <th>Started</th>
                              <th>Ended</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedExecution.tasks.map((task: Task) => (
                              <tr key={task.id}>
                                <td>{task.name}</td>
                                <td>
                                  <Badge bg={getStatusBadgeVariant(task.status)}>
                                    {task.status}
                                  </Badge>
                                </td>

                                <td>
                                  <pre>
                                    {JSON.stringify(
                                      (() => {
                                        try {
                                          return JSON.parse(task.custom_status);
                                        } catch (e) {
                                          if (!task.custom_status) {
                                            return {};
                                          }
                                          return { "error": `Could not parse json ${e}` };
                                        }
                                      })(),
                                      null,
                                      2
                                    )}
                                  </pre>
                                </td>
                                <td>{formatDate(task.start_date)}</td>
                                <td>{formatDate(task.end_date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p className="text-muted">No tasks found for this execution.</p>
                      )}
                    </Card.Body>
                  </Card>
                ) : (
                  <Card>
                    <Card.Body className="text-center text-muted">
                      Select an execution to view details
                    </Card.Body>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default RecordExecutions;
