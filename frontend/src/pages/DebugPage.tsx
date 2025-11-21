import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useError } from '../contexts/ErrorContext';
import { useSuccess } from '../contexts/SuccessContext';
import { DebugAPI } from '../services/api';
//import './DebugPage.css'; // Import CSS file for styling

const DebugPage: React.FC = () => {
    const [debugText, setDebugText] = useState("Bug in Debug page");
    const { setSuccess } = useSuccess();
    const { setError } = useError();
    const handleSendError = () => {
        setSuccess("Frontend error triggered")
        throw new Error(debugText);

    };

    const handleTriggerBackendError = async () => {
        try {
            await DebugAPI.triggerBackendError();
            setSuccess("error sent by BE.Division by 0.")
        } catch (error) {
            console.error("Failed to trigger backend error:", error);
            setError("Front end error requesting BE error")
        }
    };

    return (
        <Container className="debug-page-container">
            <Row className="mb-4">
                <Col>
                    <h1 className="debug-title">Debug Page</h1>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col>
                    <Form.Group controlId="debugInput">
                        <Form.Label>Enter Debug Text:</Form.Label>
                        <Form.Control
                            type="text"
                            value={debugText}
                            onChange={(e) => setDebugText(e.target.value)}
                            className="debug-input"
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="danger" onClick={handleSendError} className="me-2">
                        Send Frontend Error to Sentry
                    </Button>
                    <Button variant="warning" onClick={handleTriggerBackendError}>
                        Trigger Backend Error
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default DebugPage;
