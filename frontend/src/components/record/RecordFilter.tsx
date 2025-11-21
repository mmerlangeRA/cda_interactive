import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Record, RecordTypeEnum } from "../../types";

interface RecordFilterProps {
    records: Record[];
    onFilteredRecordsChange: (records: Record[]) => void;
}

const RecordFilter: React.FC<RecordFilterProps> = ({
    records,
    onFilteredRecordsChange
}) => {

    const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
    const [recordType, setRecordType] = useState<string | null>(null);

    // Helper functions to calculate default dates
    const getDefaultEndDate = (): string => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    const getDefaultStartDate = (): string => {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return oneMonthAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    const [showEmpty, setShowEmpty] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const handleClearFilters = () => {
        setShowEmpty(true);
        setRecordType(null);
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
    };
    // Set default dates only on initial mount
    useEffect(() => {
        handleClearFilters()
    }, []);

    // Log when records change
    useEffect(() => {
        if (!records.length) {
            setFilteredRecords([])
            return;
        }
        const emptyRecords = showEmpty ? records.filter(record => { return (record.type == RecordTypeEnum.UNKNOWN); }) : [];
        const recordsWithVideo = records.filter(record => { return (record.videos.length > 0); })
        const recordsWithVideoFiltered = recordsWithVideo.filter(record => {
            // Filter by record type
            if (recordType && record.type !== recordType) {
                return false;
            }

            // Filter by date range (if either start or end date is provided)
            if (startDate || endDate) {
                const recordDate = new Date(record.created_at);
                if (startDate) {
                    const startDateObj = new Date(startDate);
                    if (recordDate < startDateObj) return false;
                }

                // Check end date if provided
                if (endDate) {
                    const endDateObj = new Date(endDate);
                    // Set end date to end of day
                    endDateObj.setHours(23, 59, 59, 999);
                    if (recordDate > endDateObj) return false;
                }

                return true;
            }

            return true;
        });

        //concatenate the 2 arrays
        const recordsArray = emptyRecords.concat(recordsWithVideoFiltered).sort((a, b) => { return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() });

        setFilteredRecords(recordsArray);
    }, [records, startDate, endDate, showEmpty, recordType]);



    // Notify parent component when filtered records change
    useEffect(() => {
        onFilteredRecordsChange(filteredRecords);
    }, [filteredRecords, onFilteredRecordsChange]);



    return (
        <div className="record-filter bg-light p-3 mb-4 border rounded">
            <h5 className="border-bottom pb-2 mb-3">Record Filters</h5>
            {/* Allow empty records */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Empty records</Form.Label>
                <Form.Check
                    type="checkbox"
                    checked={showEmpty}
                    onChange={(e) => setShowEmpty(e.target.checked)}
                />
            </Form.Group>
            {/* Record Type Filter */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Record Type</Form.Label>
                <Form.Select
                    value={recordType || ''}
                    onChange={(e) => setRecordType(e.target.value || null)}
                >
                    <option value="">All Types</option>
                    <option value={RecordTypeEnum.PHOTO}>Photo</option>
                    <option value={RecordTypeEnum.PANORAMA}>Panorama</option>
                    <option value={RecordTypeEnum.UNKNOWN}>Unknown</option>
                </Form.Select>
            </Form.Group>

            {/* Date Range Filters */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Start Date</Form.Label>
                <Form.Control
                    type="date"
                    value={startDate || ''}
                    onChange={(e) => setStartDate(e.target.value || null)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">End Date</Form.Label>
                <Form.Control
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value || null)}
                />
            </Form.Group>

            {/* Clear Filters Button */}
            <Button
                variant="outline-secondary"
                size="sm"
                className="w-100"
                onClick={handleClearFilters}
            >
                Clear Filters
            </Button>

            <div className="mt-3 text-muted small">
                <p>Showing {filteredRecords.length} of {records.length} records</p>
            </div>

        </div>
    );
};

export default RecordFilter;
