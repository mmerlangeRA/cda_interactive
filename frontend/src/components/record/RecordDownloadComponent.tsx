import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Download, Folder, FolderFill } from 'react-bootstrap-icons';
import { useError } from "../../contexts/ErrorContext";
import { RecordsAPI } from '../../services/api';
import DownloadComponent from '../DownloadComponent';

interface RecordDownloadComponentProps {
  recordId: number;
  containerType: 'raw' | 'extracted' | 'processed';
  name?: string;
  tooltip?: string;
}

interface FolderData {
  [folderName: string]: string[];
}

const RecordDownloadComponent: React.FC<RecordDownloadComponentProps> = ({
  recordId,
  containerType,
  name,
  tooltip
}) => {
  const [folderData, setFolderData] = useState<FolderData>({});
  const [allUrls, setAllUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [isComponentExpanded, setIsComponentExpanded] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const { setError } = useError();

  // Generate a display name if not provided
  const displayName = name || `${containerType.charAt(0).toUpperCase() + containerType.slice(1)} Files`;

  // Fetch data only when component is expanded and data hasn't been fetched yet
  useEffect(() => {
    if (isComponentExpanded && !dataFetched) {
      fetchDownloadUrls();
    }
  }, [isComponentExpanded, dataFetched, recordId, containerType]);

  const fetchDownloadUrls = async () => {
    try {
      setLoading(true);

      const response = await RecordsAPI.listBlobDownloadUrlsWithFolders(recordId, containerType);
      setFolderData(response.data.folders);

      // Combine all URLs for the "Download All" button
      const allUrlsArray: string[] = [];
      Object.values(response.data.folders).forEach(urls => {
        allUrlsArray.push(...urls);
      });
      setAllUrls(allUrlsArray);
      setDataFetched(true);
    } catch (err) {
      console.error('Error fetching download URLs:', err);
      setError('Failed to load download URLs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderName: string, event: React.MouseEvent) => {
    // Stop propagation to prevent the component toggle from being triggered
    event.stopPropagation();

    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  const toggleComponent = () => {
    setIsComponentExpanded(prev => !prev);
  };

  const getTotalFileCount = () => {
    return allUrls.length;
  };

  return (
    <div className="record-download-component card mb-3">
      <div
        className="card-header d-flex justify-content-between align-items-center"
        onClick={toggleComponent}
        style={{ cursor: 'pointer' }}
        title={tooltip}
      >
        <h5 className="mb-0 d-flex align-items-center">
          {isComponentExpanded ? <ChevronDown className="me-2" /> : <ChevronRight className="me-2" />}
          {displayName}
          {dataFetched && ` (${getTotalFileCount()} files)`}
        </h5>
      </div>

      {isComponentExpanded && (
        <div className="card-body">
          {loading && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading download links...</p>
            </div>
          )}


          {!loading && dataFetched && Object.keys(folderData).length > 0 && (
            <>
              {/* Download all files button */}
              {allUrls.length > 0 && (
                <div className="mb-3">
                  <DownloadComponent
                    name={`All ${displayName}`}
                    urls={allUrls}
                  />
                </div>
              )}

              {/* Display folders and files */}
              <div className="folders-container">
                {Object.entries(folderData).map(([folderName, urls]) => (
                  <div key={folderName} className="folder-group mb-3">
                    <div
                      className="folder-header d-flex justify-content-between align-items-center p-2 bg-light rounded"
                      onClick={(e) => toggleFolder(folderName, e)}
                      style={{ cursor: 'pointer' }}
                    >
                      <h6 className="mb-0 d-flex align-items-center">
                        {expandedFolders.has(folderName) ?
                          <FolderFill className="me-2" size={16} /> :
                          <Folder className="me-2" size={16} />
                        }
                        {folderName === 'root' ? 'Root Files' : folderName} ({urls.length} files)
                      </h6>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DownloadComponent
                          name={folderName === 'root' ? 'Root Files' : folderName}
                          urls={urls}
                        />
                      </div>
                    </div>

                    {expandedFolders.has(folderName) && (
                      <ul className="list-group mt-2">
                        {urls.map((url, index) => {
                          // Extract filename from URL without query parameters
                          const urlWithoutParams = url.split('?')[0];
                          const filename = urlWithoutParams.split('/').pop() || `File ${index + 1}`;

                          return (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              <span className="text-truncate" style={{ maxWidth: '70%' }}>{filename}</span>
                              <a
                                href={url}
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Download size={14} />
                                Download
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordDownloadComponent;
