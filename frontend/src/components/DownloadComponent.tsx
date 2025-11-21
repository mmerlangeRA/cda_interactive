import React, { useState } from 'react';
import { ArrowClockwise, Download } from 'react-bootstrap-icons';

interface DownloadComponentProps {
  name: string;
  urls: string[];
}

const DownloadComponent: React.FC<DownloadComponentProps> = ({ name, urls }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadFile = async (url: string): Promise<void> => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download from ${url}: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Extract filename from URL without query parameters
      let filename = 'download';
      const urlWithoutParams = url.split('?')[0];
      if (urlWithoutParams) {
        filename = urlWithoutParams.substring(urlWithoutParams.lastIndexOf('/') + 1);
      }

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
      throw error;
    }
  };

  const handleDownloadAll = async () => {
    if (urls.length === 0) {
      console.warn('No URLs provided for download');
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      // Create an array of download promises with progress tracking
      const downloadPromises = urls.map((url, index) => {
        return downloadFile(url).then(() => {
          // Update progress after each successful download
          setProgress(Math.round(((index + 1) / urls.length) * 100));
        }).catch(error => {
          console.error(`Failed to download ${url}:`, error);
          // Continue with other downloads even if one fails
          setProgress(Math.round(((index + 1) / urls.length) * 100));
        });
      });

      // Wait for all downloads to complete
      await Promise.all(downloadPromises);

      console.log('All downloads completed');
    } catch (error) {
      console.error('Error during downloads:', error);
    } finally {
      setIsDownloading(false);
      setProgress(100);
    }
  };

  return (
    <div className="download-component">
      <button
        className="btn btn-primary d-flex align-items-center gap-1"
        onClick={handleDownloadAll}
        disabled={isDownloading || urls.length === 0}
      >
        {isDownloading ? (
          <>
            <ArrowClockwise className="spin-animation" size={16} />
            Downloading {name} ({progress}%)
          </>
        ) : (
          <>
            <Download size={16} />
            Download {name}
          </>
        )}
      </button>

      {isDownloading && (
        <div className="progress mt-2">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadComponent;
