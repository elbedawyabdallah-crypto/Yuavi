'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Video, 
  AlertTriangle, 
  Network, 
  Clock, 
  MapPin, 
  User, 
  FileText,
  Play,
  Pause,
  Maximize,
  CheckCircle,
  X,
  Menu,
  Activity,
  ShieldAlert,
  Settings,
  Loader,
  ArrowRight,
  LineChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all ${
      active 
        ? 'bg-primary text-primary-foreground shadow-lg' 
        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
    }`}
  >
    <Icon size={20} className="mr-3" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const VideoPlayer = ({ videoSrc, isPlaying, setIsPlaying, currentTime }: { videoSrc: string | null, isPlaying: boolean, setIsPlaying: (playing: boolean) => void, currentTime: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border shadow-2xl group">
      {videoSrc ? (
        <video 
          ref={videoRef}
          src={videoSrc} 
          className="w-full h-full object-contain"
          onEnded={() => setIsPlaying(false)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-muted-foreground flex flex-col items-center">
            <Video size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-mono">NO VIDEO LOADED</p>
          </div>
        </div>
      )}

      {videoSrc && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-primary">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex-1 h-1.5 bg-secondary rounded-full relative">
            <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>
      </div>}
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, apiKey, setApiKey }: { isOpen: boolean, onClose: () => void, apiKey: string, setApiKey: (key: string) => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-foreground mb-4">System Settings</h3>
        <label className="block text-sm text-muted-foreground mb-2">Google Gemini API Key</label>
        <input 
          type="password" 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full bg-background border border-border text-foreground p-3 rounded-lg mb-4 focus:ring-2 focus:ring-primary outline-none"
        />
        <p className="text-xs text-muted-foreground mb-6">
          Your key is used locally in your browser to process video frames. It is never stored on our servers.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">Save Config</button>
        </div>
      </div>
    </div>
  );
};


const DashboardView = ({ onUpload, processingStatus, onStartSearch, files, onFileChange, onRemoveFile }: { onUpload: any, processingStatus: string, onStartSearch: () => void, files: (File | null)[], onFileChange: (index: number, file: File) => void, onRemoveFile: (index: number) => void }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center hover:bg-secondary/50 transition-all min-h-[300px] flex flex-col items-center justify-center">
      
      {processingStatus === 'idle' && (
        <>
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Upload CCTV Footage</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Select up to 5 video files (MP4, MOV) to begin analysis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-4xl">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <label className="cursor-pointer aspect-video w-full bg-secondary/30 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                  {file ? (
                    <>
                       <CheckCircle size={24} className="text-green-500" />
                       <span className="text-xs mt-2 text-center break-all p-1">{file.name}</span>
                       <button onClick={(e) => { e.preventDefault(); onRemoveFile(index); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"><X size={12}/></button>
                    </>
                  ) : (
                    <>
                      <Video size={24}/>
                      <span className="text-xs mt-2">Camera {index + 1}</span>
                    </>
                  )}
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => { if(e.target.files) onFileChange(index, e.target.files[0]); }} />
                </label>
              </div>
            ))}
          </div>
        </>
      )}

      {processingStatus === 'ready' && (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Footage Indexed!</h3>
          <p className="text-muted-foreground text-sm mb-6">The video has been processed and is ready for AI investigation.</p>
          <button 
            onClick={onStartSearch}
            className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-900/50"
          >
            Start Investigation <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      )}

      {processingStatus !== 'idle' && processingStatus !== 'ready' && processingStatus !== 'error' && (
        <div className="flex flex-col items-center text-primary">
          <Loader size={32} className="animate-spin mb-4" />
          <span className="text-lg font-mono text-foreground mb-2">{processingStatus}</span>
          <p className="text-xs text-muted-foreground">Extracting keyframes for Gemini...</p>
        </div>
      )}

      {processingStatus === 'error' && (
        <div className="flex flex-col items-center text-destructive">
           <AlertTriangle size={32} className="mb-2" />
           <p>Failed to process video. Please try a shorter clip.</p>
           <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Try Again</button>
        </div>
      )}
    </div>
  </div>
);

const SemanticSearchView = ({ isSearching, setIsSearching, searchResults, setSearchResults, frames, apiKey, videoSrc }: { isSearching: boolean, setIsSearching: (isSearching: boolean) => void, searchResults: any[], setSearchResults: (results: any[]) => void, frames: any[], apiKey: string, videoSrc: string | null }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      toast({ variant: 'destructive', title: "API Key Missing", description: "Please configure your API Key in settings first." });
      return;
    }
    if (!frames.length) {
      toast({ variant: 'destructive', title: "No Video", description: "Please upload and process a video first." });
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      // This is a mock response. Replace with your actual Genkit flow call.
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSearchResults([
        { timestamp: "00:00:12", description: "A person in a red jacket enters the frame from the left.", confidence: 95 },
        { timestamp: "00:00:25", description: "The person in the red jacket walks towards the exit.", confidence: 92 },
      ]);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      toast({ variant: 'destructive', title: "Analysis Failed", description: err.message });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-card p-6 rounded-xl border border-border mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Video Semantic Search</h2>
        <p className="text-muted-foreground text-sm mb-4">Ask Gemini to find complex events in your uploaded video.</p>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-lg mb-4 text-sm flex items-center">
            <AlertTriangle size={16} className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g., "Find the man in the red jacket", "When does the car leave?"'
            className="w-full bg-background border border-border text-foreground p-4 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-muted-foreground"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:bg-secondary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            {isSearching ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="lg:col-span-1 bg-card/50 rounded-xl border border-border overflow-y-auto">
          <div className="p-4 border-b border-border sticky top-0 bg-card/90 backdrop-blur z-10">
            <h3 className="font-semibold text-foreground">Timeline Events</h3>
            <span className="text-xs text-muted-foreground">{searchResults.length} events found</span>
          </div>
          <div className="p-2 space-y-2">
            {isSearching ? (
               <div className="p-8 text-center text-muted-foreground">
                 <Loader className="animate-spin w-8 h-8 text-primary mx-auto mb-4" />
                 <p>Sending frames to Gemini...</p>
                 <p className="text-xs mt-2 opacity-50">Analyzing visual context</p>
               </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <div key={idx} className="bg-secondary p-3 rounded-lg border border-border hover:border-primary cursor-pointer group transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-primary font-mono text-sm font-bold">{res.timestamp}</span>
                    <span className="text-[10px] bg-background px-1.5 py-0.5 rounded text-muted-foreground">Match</span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{res.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${res.confidence}%` }}></div>
                    </div>
                    <span className="text-[10px] text-green-400">{res.confidence}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No events found. Try uploading a video and searching.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer videoSrc={videoSrc} isPlaying={isPlaying} setIsPlaying={setIsPlaying} currentTime={currentTime} />
          <div className="bg-card/50 p-4 rounded-xl border border-border">
             <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
               <Activity size={16} className="mr-2 text-primary" /> System Log
             </h4>
             <p className="text-xs text-muted-foreground leading-relaxed font-mono">
               {frames.length > 0 ? `Loaded ${frames.length} frames from video.` : 'Waiting for video upload...'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimilarityView = ({ apiKey, frames }: { apiKey: string, frames: any[] }) => {
    const { toast } = useToast();
    const [suspectImg, setSuspectImg] = useState<string | null>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const dataUri = await fileToDataUri(file);
            setSuspectImg(dataUri);
        }
    };

    const runSimilaritySearch = async () => {
        if (!frames.length || !suspectImg) {
            toast({ variant: 'destructive', title: "Missing Input", description: "Please upload a suspect image and video." });
            return;
        }

        if (!apiKey) {
            toast({ variant: 'destructive', title: "API Key Missing", description: "Please set your API key in settings." });
            return;
        }

        setIsAnalyzing(true);
        setMatches([]);
        try {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 2000));
            setMatches([
                { timestamp: "00:00:12", similarity: 90, reason: "Exact face match and red jacket" },
                { timestamp: "00:01:45", similarity: 85, reason: "Similar clothing and body shape detected near the entrance." }
            ]);

        } catch (err: any) {
            toast({ variant: 'destructive', title: "Analysis Failed", description: err.message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in zoom-in-95 duration-300">
            <div className="flex gap-6 h-full">
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden aspect-square">
                        {suspectImg ? (
                            <img src={suspectImg} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        ) : null}
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <User size={32} className="text-primary mb-2" />
                            <h3 className="text-lg font-semibold text-foreground">Suspect Image</h3>
                            <label className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm cursor-pointer">
                                {suspectImg ? "Change Photo" : "Upload Photo"}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={runSimilaritySearch}
                        disabled={isAnalyzing || !suspectImg || frames.length === 0}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-secondary text-white rounded-xl font-bold transition-all flex items-center justify-center"
                    >
                        {isAnalyzing ? <Loader className="animate-spin mr-2" /> : <Search className="mr-2" />}
                        Run Comparison
                    </button>
                </div>

                <div className="flex-1 bg-card/50 rounded-xl border border-border p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                        <User size={20} className="mr-2 text-purple-400" />
                        {isAnalyzing ? "Scanning Video..." : `Matches Found (${matches.length})`}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.map((match, idx) => (
                            <div key={idx} className="bg-secondary rounded-lg overflow-hidden border border-border group">
                                <div className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-foreground text-sm font-medium">Found at {match.timestamp}</span>
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">{match.similarity}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">{match.reason}</p>
                                </div>
                            </div>
                        ))}
                        {!isAnalyzing && matches.length === 0 && (
                            <p className="text-muted-foreground text-sm col-span-full text-center py-10">Upload a suspect photo and a video, then run the comparison to see results.</p>
                        )}
                         {isAnalyzing && (
                            <div className="text-muted-foreground text-sm col-span-full text-center py-10">
                                <Loader className="animate-spin w-8 h-8 text-purple-500 mx-auto mb-4" />
                                Comparing suspect against video frames...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [files, setFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [processingStatus, setProcessingStatus] = useState('idle');

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const handleFileChange = (index: number, file: File) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);

    // For simplicity, we'll only process and display the first video.
    // This can be extended to handle multiple video contexts.
    if(index === 0 && file) {
      handleVideoProcess(file);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
    if(index === 0) {
      setVideoSrc(null);
      setFrames([]);
      setProcessingStatus('idle');
    }
  };

  const handleVideoProcess = async (file: File) => {
    if (!file) return;

    setVideoSrc(URL.createObjectURL(file));
    setProcessingStatus('Extracting keyframes...');
    setFrames([]);

    try {
      // Mock frame extraction
      await new Promise(res => setTimeout(res, 1500));
      const mockFrames = Array.from({ length: 11 }, (_, i) => ({
        time: i * 2,
        timestamp: new Date(i * 2 * 1000).toISOString().substr(11, 8),
        data: 'dummy_base64_data'
      }));
      setFrames(mockFrames);
      setProcessingStatus('ready');
    } catch (err) {
      console.error(err);
      setProcessingStatus('error');
    }
  };

  const renderContent = () => {
      switch (activeTab) {
        case 'dashboard': 
          return <DashboardView 
            onUpload={handleVideoProcess} 
            processingStatus={processingStatus} 
            onStartSearch={() => setActiveTab('semantic')}
            files={files}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
            />;
        case 'semantic': 
          return <SemanticSearchView 
            isSearching={isSearching} 
            setIsSearching={setIsSearching} 
            searchResults={searchResults} 
            setSearchResults={setSearchResults}
            frames={frames}
            apiKey={apiKey}
            videoSrc={videoSrc}
          />;
        case 'similarity': 
          return <SimilarityView apiKey={apiKey} frames={frames} />;
        default: 
          return <DashboardView onUpload={handleVideoProcess} processingStatus={processingStatus} onStartSearch={() => setActiveTab('semantic')} files={files} onFileChange={handleFileChange} onRemoveFile={handleRemoveFile}/>;
      }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      
      <div className="w-64 bg-card border-r border-border flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <ShieldAlert size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-none">CCTV Forensic</h1>
            <span className="text-[10px] text-primary tracking-wider">GEMINI POWERED</span>
          </div>
        </div>

        <nav className="flex-1">
          <SidebarItem icon={Activity} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Search} label="Semantic Search" active={activeTab === 'semantic'} onClick={() => setActiveTab('semantic')} />
          <SidebarItem icon={User} label="Similarity Search" active={activeTab === 'similarity'} onClick={() => setActiveTab('similarity')} />
        </nav>

        <div className="mt-auto space-y-4">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="flex items-center w-full p-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
           >
             <Settings size={20} className="mr-3" />
             <span className="font-medium text-sm">Settings (API Key)</span>
             {!apiKey && <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
             {apiKey && <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>}
           </button>
           
           <div className="bg-secondary/50 p-4 rounded-xl border border-border">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
               <div>
                 <p className="text-xs font-bold text-foreground">Investigator</p>
                 <p className="text-[10px] text-muted-foreground">{frames.length > 0 ? 'System Ready' : 'Idle'}</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-foreground capitalize">{activeTab.replace('-', ' ')}</h2>
          {frames.length > 0 && (
             <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
               {frames.length} Frames Indexed
             </span>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background">
          {renderContent()}
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
      />
    </div>
  );
};

export default App;
