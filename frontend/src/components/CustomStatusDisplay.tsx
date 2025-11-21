import React from 'react';

interface CustomStatusDisplayProps {
  status: string;
}

const CustomStatusDisplay: React.FC<CustomStatusDisplayProps> = ({ status }) => {
  const tryParseJSON = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const formatJSON = (json: any) => {
    if (typeof json === 'object' && json !== null) {
      return (
        <div className="json-status">
          {Object.entries(json).map(([key, value], index) => (
            <div key={index} className="json-status-row">
              <span className="json-key">{key}:</span>
              <span className="json-value">
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2)
                  : String(value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const parsedJSON = tryParseJSON(status);
  if (parsedJSON) {
    return formatJSON(parsedJSON);
  }

  return <span>{status || "-"}</span>;
};

export default CustomStatusDisplay;
