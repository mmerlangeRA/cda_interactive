import { VideoType, VideoTypeEnum } from "../types";

export const getVideoType = (filename: string): VideoType => {
    return filename.toLowerCase().endsWith('.360') ? VideoTypeEnum.PANORAMA : VideoTypeEnum.PHOTO;
};

export const isVideoTypeCompliantWithRecord = (fileType: string, recordType: string) => {
    if (recordType != "UNKNOWN" && fileType != recordType) {
        return false
    }
    return true
}