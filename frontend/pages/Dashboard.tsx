import React, { useState, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Modal, Button } from '../components/ui';
import { Icons } from '../components/icons';
import type { FeedbackItem, FeedbackSource, Sentiment, SentimentTrendPoint, Topic } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { uploadDocument } from '../services/apiService';
import ReactMarkdown from 'react-markdown';

// --- UPLOAD MODAL COMPONENT ---
const UploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setIsUploading(false);
    setIsDragging(false);
    setUploadStatus(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelect = (selectedFile: File | null | undefined) => {
    if (selectedFile) {
      handleReset();
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const result = await uploadDocument(file);
      setUploadStatus({ success: true, message: result.message });
      onUploadSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Upload failed. Please try again.';
      setUploadStatus({ success: false, message: errorMessage });
    } finally {
      setIsUploading(false);
    }
  };

  const renderStatus = () => {
    if (!uploadStatus) return null;
    return (
        <p className={cn("text-sm mt-4 text-center p-2 rounded-md", uploadStatus.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
            {uploadStatus.message}
        </p>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle>Upload Document</CardTitle>
                 <p className="text-sm text-gray-400 pt-1">Upload a PDF or DOCX file to add its contents to the AI Assistant's knowledge base.</p>
            </CardHeader>
            <CardContent className="p-0">
                {!file ? (
                    <div
                        onDragEnter={handleDragEnter} onDragOver={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className={cn('flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors', isDragging ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600')}
                    >
                        <Icons.document className="h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-gray-300 font-semibold">Drag & drop a document here</p>
                        <p className="text-gray-400 text-sm mt-1">Supports: PDF, DOCX</p>
                        <Button type="button" className="mt-4 bg-gray-600 hover:bg-gray-500" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0])} accept=".pdf,.docx" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Icons.document className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                <span className="text-sm text-gray-200 truncate" title={file.name}>{file.name}</span>
                            </div>
                            <button onClick={() => setFile(null)} disabled={isUploading}><Icons.close className="h-4 w-4 text-gray-400 hover:text-white" /></button>
                        </div>
                        <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
                            {isUploading ? <><Icons.loader className="h-4 w-4 mr-2 animate-spin" /> Ingesting...</> : 'Ingest Document'}
                        </Button>
                        {renderStatus()}
                    </div>
                )}
            </CardContent>
        </div>
    </Modal>
  );
};

// --- FEEDBACK VIEWER MODAL ---
const FeedbackViewerModal: React.FC<{
  item: FeedbackItem | null;
  onClose: () => void;
}> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose}>
      <div className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>Full Feedback</CardTitle>
          <p className="text-sm text-gray-400 pt-1">
            Source: {item.source} | Date: {item.timestamp}
          </p>
        </CardHeader>
        <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none text-gray-300">
             <ReactMarkdown>{item.text}</ReactMarkdown>
          </div>
        </CardContent>
      </div>
    </Modal>
  );
};

// --- SUB-COMPONENTS ---

const SentimentTrendChart: React.FC<{ data: SentimentTrendPoint[] | null; isLoading: boolean }> = ({ data, isLoading }) => (
  <Card>
    <CardHeader><CardTitle>Sentiment Over Time</CardTitle></CardHeader>
    <CardContent>
      <div className="h-72">
        {isLoading || !data ? <Skeleton className="h-full w-full" /> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickCount={8} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }} />
              <Legend wrapperStyle={{fontSize: "14px"}} />
              <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="neutral" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardContent>
  </Card>
);

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border border-gray-700 bg-gray-800 p-3 text-sm shadow-lg">
        <p className="font-bold text-white">{`${data.name}`}</p>
        <p className="text-gray-300">{`Reviews: ${data.value.toLocaleString()}`}</p>
        <p className="text-gray-400">{`(${data.percentage}%)`}</p>
      </div>
    );
  }
  return null;
};

const TopicDistributionChart: React.FC<{ data: Topic[] | null; isLoading: boolean }> = ({ data, isLoading }) => {
    return (
        <Card>
            <CardHeader><CardTitle>Topic Distribution</CardTitle></CardHeader>
            <CardContent>
                <div className="h-72">
                    {isLoading || !data ? <Skeleton className="h-full w-full rounded-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend wrapperStyle={{fontSize: "14px"}} />
                                <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={5}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const FeedbackDataTable: React.FC<{ 
  data: FeedbackItem[] | null; 
  isLoading: boolean;
  onRowClick: (item: FeedbackItem) => void;
}> = ({ data, isLoading, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof FeedbackItem; direction: 'ascending' | 'descending' }>({ key: 'timestamp', direction: 'descending' });
  
  const sortedItems = useMemo(() => {
    if (!data) return [];
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) { return sortConfig.direction === 'ascending' ? -1 : 1; }
        if (a[sortConfig.key] > b[sortConfig.key]) { return sortConfig.direction === 'ascending' ? 1 : -1; }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof FeedbackItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof FeedbackItem) => {
    if (!sortConfig || sortConfig.key !== key) { return null; }
    return sortConfig.direction === 'ascending' ? <Icons.arrowUp className="h-4 w-4 ml-1" /> : <Icons.arrowDown className="h-4 w-4 ml-1" />;
  };

  const sentimentClasses: Record<Sentiment, string> = { positive: 'bg-green-500/10 text-green-400 border-green-500/20', negative: 'bg-red-500/10 text-red-400 border-red-500/20', neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  const sourceIcons: Record<FeedbackSource, React.ReactNode> = { twitter: <Icons.twitter className="h-5 w-5 text-sky-400" />, app_store: <Icons.appStore className="h-5 w-5 text-gray-300" />, support_ticket: <Icons.supportTicket className="h-5 w-5 text-amber-400" />, document: <Icons.document className="h-5 w-s text-purple-400" />, dataset: <Icons.dataset className="h-5 w-5 text-teal-400" />, };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader><CardTitle>Recent Feedback</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('source')}><div className="flex items-center">Source {getSortIcon('source')}</div></th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('sentiment')}><div className="flex items-center">Sentiment {getSortIcon('sentiment')}</div></th>
                <th scope="col" className="px-6 py-3">Feedback</th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('timestamp')}><div className="flex items-center">Date {getSortIcon('timestamp')}</div></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="px-6 py-4"><Skeleton className="h-5 w-5" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))}
              {!isLoading && sortedItems.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer" onClick={() => onRowClick(item)}>
                  <td className="px-6 py-4">{sourceIcons[item.source]}</td>
                  <td className="px-6 py-4"><span className={cn('px-2 py-1 text-xs font-medium rounded-full border', sentimentClasses[item.sentiment])}>{item.sentiment}</span></td>
                  {/* --- FINAL FIX: Use the summary field for the table --- */}
                  <td className="px-6 py-4 text-gray-300 max-w-md truncate">{item.summary || item.text}</td>
                  <td className="px-6 py-4 text-gray-400">{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardApi();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
            <Icons.plus className="h-4 w-4 mr-2" />
            Upload Document
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SentimentTrendChart data={data?.sentimentTrend || null} isLoading={isLoading} />
        <TopicDistributionChart data={data?.topicDistribution || null} isLoading={isLoading} />
        <FeedbackDataTable 
          data={data?.recentFeedback || null} 
          isLoading={isLoading} 
          onRowClick={setSelectedFeedback} 
        />
      </div>
        <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={refetch}
        />
        <FeedbackViewerModal
            item={selectedFeedback}
            onClose={() => setSelectedFeedback(null)}
        />
    </motion.div>
  );
}