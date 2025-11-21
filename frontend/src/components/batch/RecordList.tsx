import { VideoTypeEnum } from "../../types";
import { RecordGroup } from "./useBatchUpload";

export const RecordList = ({ records }: { records: RecordGroup[] }) => (
    <div className="mb-3">
        <p>The following records will be created:</p>
        <ul className="list-group">
            {records.map((group, index) => (
                <li key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>{group.recordName}</strong>
                        <span className={`badge ${group.type === VideoTypeEnum.PANORAMA ? 'bg-success' : 'bg-primary'}`}>
                            {group.type}
                        </span>
                    </div>
                    <div>
                        <small className="text-muted">
                            Date: {group.lastModifiedDate.toLocaleString()}
                        </small>
                    </div>
                    <div>
                        <small>
                            {group.videos.length} video{group.videos.length !== 1 ? 's' : ''}
                        </small>
                    </div>
                    <div className="mt-2">
                        <ul className="list-unstyled ms-3 small">
                            {group.videos.slice(0, 3).map((video, vidIndex) => (
                                <li key={vidIndex}>{video.file.name}</li>
                            ))}
                            {group.videos.length > 3 && (
                                <li>...and {group.videos.length - 3} more</li>
                            )}
                        </ul>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);
