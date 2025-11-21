import { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Navbar from "react-bootstrap/Navbar";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import logoImage from "./assets/Logo_Logiroad.webp";
import ErrorAlert from "./components/ErrorAlert";
import NetworkList from "./components/network/NetworkList";
import NetworkSummary from "./components/network/NetworkSummary";
import RecordFilter from "./components/record/RecordFilter";
import RecordList from "./components/record/RecordList";
import SuccessAlert from "./components/SuccessAlert";
import { ErrorProvider, useError } from "./contexts/ErrorContext";
import { SuccessProvider } from "./contexts/SuccessContext";
import DebugPage from "./pages/DebugPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import { PhotoAPI, RecordsAPI } from "./services/api";
import { logout } from "./services/auth";
import { Network, PhotoCollection, Record } from "./types";

function MainLayout() {
  const navigate = useNavigate();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [photoCollections, setPhotoCollections] = useState<PhotoCollection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const { setError } = useError();
  // <Spinner animation="border" size="sm" />

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      setError(`Logout failed:${error}`);
    }
  };

  const handleNetworkChange = (network: Network | null) => {
    setSelectedNetwork(network);

    // Load photo collections when network changes
    if (network && network.slug) {
      loadPhotoCollections(network.slug);
    } else {
      setPhotoCollections([]);
    }

    if (network && network.uuid) {
      loadRecords(network.uuid);
    } else {
      setRecords([])
    }
  };

  const loadPhotoCollections = async (networkSlug: string) => {
    setLoadingCollections(true);
    try {
      const response = await PhotoAPI.getCollections(networkSlug);
      setPhotoCollections(response.data);
    } catch (error) {
      setError(`Error loading photo collections:${error}`);
      setPhotoCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  const loadRecords = async (networkUUID: string) => {
    setLoadingRecords(true);
    try {
      const response = await RecordsAPI.getByNetwork(networkUUID);
      setRecords(response.data);
    } catch (error) {
      setError(`Error loading photo collections:${error}`);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }

  const refreshRecord = async (recordId: number) => {
    try {
      //let's fetch the new value
      const axiosRequest = await RecordsAPI.getRecord(recordId);
      const updatedRecord = axiosRequest.data;
      //update list
      const updatedRecords = records.map(record =>
        record.id === updatedRecord.id ? updatedRecord : record
      );
      setRecords(updatedRecords);
    } catch (e) {
      setError(`Error with updating record ${recordId} ${e}`)
    }
  }

  const addRecord = (record: Record) => {
    const newRecords = records.concat([record]);
    setRecords(newRecords)
  }

  const onRecordUpdated = async (record: Record | null) => {
    try {
      if (record == null) {
        if (selectedNetwork)
          await loadRecords(selectedNetwork.uuid)
        return
      }
      //check if record.id 
      const isRecordInList = records.find((r) => r.id == record.id)
      if (!isRecordInList) {
        addRecord(record);
        return;
      }
      await refreshRecord(record.id);
    } catch (e) {
      setError(`Error with updating record ${e}`)
    }


  }

  const handleFilteredRecordsChange = (records: Record[]) => {
    setFilteredRecords(records);
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-0 fixed-top">
        <Container>
          <Navbar.Brand className="d-flex align-items-center">
            <Image
              src={logoImage}
              alt="Logiroad Logo"
              height="30"
              className="me-2"
            />
            <h3 style={{ marginLeft: "10%" }}>New production chain</h3>
          </Navbar.Brand>
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </Container>
      </Navbar>

      <div className="d-flex" style={{ marginTop: "56px", height: "calc(100vh - 56px)" }}>
        {/* Left Sidebar */}
        <div className="bg-light border-end position-fixed" style={{ width: "280px", height: "calc(100vh - 56px)", overflowY: "auto" }}>
          <div className="p-3  border-top">
            <NetworkList
              onNetworkSelect={handleNetworkChange}
            />
          </div>

          <RecordFilter
            records={records}
            onFilteredRecordsChange={handleFilteredRecordsChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-3" style={{ marginLeft: "280px", overflowY: "auto", height: "calc(100vh - 56px)" }}>
          {selectedNetwork && (
            <div className="card-body">
              {/* Network Summary Component */}
              <NetworkSummary
                network={selectedNetwork}
                records={records}
                photoCollections={photoCollections}
                loadingCollections={loadingCollections}
              />
              <div>
                <h5 className="mt-4 mb-3">Records</h5>
                <p className="text-muted">
                  Showing {filteredRecords.length} records
                </p>
                <RecordList
                  loadingRecords={loadingRecords}
                  selectedNetwork={selectedNetwork}
                  records={filteredRecords}
                  onRecordUpdated={onRecordUpdated}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorProvider>
      <SuccessProvider>
        <ErrorAlert />
        <SuccessAlert />
        <Router>
          <Routes>
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SuccessProvider>
    </ErrorProvider>
  );
}
