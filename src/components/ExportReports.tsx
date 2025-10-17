"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Calendar, CheckCircle } from "lucide-react";

interface ExportReportsProps {
  selectedTimeRange: 'day' | 'week' | 'month';
  selectedRoom: string;
}

export function ExportReports({ selectedTimeRange, selectedRoom }: ExportReportsProps) {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const getTimeRangeLabel = () => {
    switch (selectedTimeRange) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'This Week';
    }
  };

  const getRoomLabel = () => {
    if (selectedRoom === 'all') return 'All Rooms';
    const roomNames: { [key: string]: string } = {
      'confa': 'Conference Room A',
      'greathall': 'Great Hall',
      'seminar': 'Seminar Room',
      'studentlounge206': 'Student Lounge',
      'pavx-upper': 'Pavilion X Upper',
      'pavx-b1': 'Pavilion X B1',
      'pavx-b2': 'Pavilion X B2',
      'pavx-exhibit': 'Pavilion X Exhibit',
    };
    return roomNames[selectedRoom] || selectedRoom;
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    setExporting(true);
    setExportSuccess(null);

    try {
      // Simulate export process (in production, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const filename = `room-analytics-${selectedRoom}-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.${format}`;

      // Show success message
      setExportSuccess(`Report exported: ${filename}`);
      setTimeout(() => setExportSuccess(null), 5000);

      // In production, you would trigger actual file download here
      console.log(`Exporting report: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-6 h-6 text-uva-orange" />
        <h2 className="text-2xl font-bold text-uva-navy">Export Reports</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Download comprehensive analytics reports for {getRoomLabel()} ({getTimeRangeLabel()})
      </p>

      {/* Success Message */}
      {exportSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-semibold">{exportSuccess}</p>
        </div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV Export */}
        <button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-uva-orange hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center text-center">
            <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-uva-navy mb-2">CSV Spreadsheet</h3>
            <p className="text-xs text-gray-600 mb-4">
              Detailed data export for Excel or Google Sheets analysis
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-uva-orange">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Download CSV'}
            </div>
          </div>

          {/* Included Data */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Room usage statistics</li>
              <li>• Booking details & timestamps</li>
              <li>• Capacity metrics</li>
              <li>• Daily utilization rates</li>
            </ul>
          </div>
        </button>

        {/* PDF Export */}
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting}
          className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-uva-orange hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center text-center">
            <FileText className="w-12 h-12 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-uva-navy mb-2">PDF Report</h3>
            <p className="text-xs text-gray-600 mb-4">
              Professional formatted report with charts and visualizations
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-uva-orange">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Download PDF'}
            </div>
          </div>

          {/* Included Data */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Executive summary</li>
              <li>• Usage trend charts</li>
              <li>• Peak hours heatmap</li>
              <li>• Capacity analysis</li>
            </ul>
          </div>
        </button>

        {/* JSON Export */}
        <button
          onClick={() => handleExport('json')}
          disabled={exporting}
          className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-uva-orange hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center text-center">
            <Calendar className="w-12 h-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-uva-navy mb-2">JSON Data</h3>
            <p className="text-xs text-gray-600 mb-4">
              Raw data export for custom integrations and API usage
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-uva-orange">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Download JSON'}
            </div>
          </div>

          {/* Included Data */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Complete event data</li>
              <li>• ICS calendar format</li>
              <li>• Metadata & timestamps</li>
              <li>• API-ready structure</li>
            </ul>
          </div>
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Reports reflect current filter selections ({getRoomLabel()}, {getTimeRangeLabel()}).
          Change filters above to export different data ranges.
        </p>
      </div>
    </div>
  );
}
