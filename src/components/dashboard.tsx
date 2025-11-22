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
  LineChart,
  CaseSensitive,
  PlusCircle,
  Trash2,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import { semanticVideoSearch } from '@/ai/flows/semantic-video-search';
import { similaritySearch } from '@/ai/flows/similarity-search';
import { linkCases } from '@/ai/flows/case-linking';
import { format } from 'date-fns';

// --- Components ---

const ClientOnlyTimestamp = ({ timestamp }: { timestamp: string }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(timestamp), 'PPpp'));
    } catch (e) {
      console.error("Invalid timestamp for formatting:", timestamp);
      setFormattedDate("Invalid Date");
    }
  }, [timestamp]);

  if (!formattedDate) {
    return null; // Or a loading skeleton
  }

  return <span>{formattedDate}</span>;
};


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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      const progressBar = document.getElementById('video-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [videoSrc]);

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
            <div id="video-progress-bar" className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>
      </div>}
    </div>
  );
};

const DashboardView = ({
  processingStatus,
  onStartSearch,
  files,
  onFileChange,
  onRemoveFile,
  onAddCamera,
  onNewCase,
  newCaseName,
  setNewCaseName,
  newCaseLocation,
  setNewCaseLocation,
}: {
  processingStatus: string;
  onStartSearch: () => void;
  files: (File | null)[];
  onFileChange: (index: number, file: File) => void;
  onRemoveFile: (index: number) => void;
  onAddCamera: () => void;
  onNewCase: () => void;
  newCaseName: string;
  setNewCaseName: (name: string) => void;
  newCaseLocation: string;
  setNewCaseLocation: (location: string) => void;
}) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Upload and manage your CCTV footage.</p>
      </div>
      <button onClick={onNewCase} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold">
        <PlusCircle size={16} />
        New Case
      </button>
    </div>

    <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center hover:bg-secondary/50 transition-all min-h-[300px] flex flex-col items-center justify-center">
      
      {processingStatus === 'idle' && (
        <>
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Upload CCTV Footage</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Select video files to begin analysis. Use the plus button to add more camera slots.
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
           <button onClick={onAddCamera} className="mt-6 flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm">
            <PlusCircle size={16} />
            Add Camera
          </button>
        </>
      )}

      {processingStatus === 'ready' && (
        <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full max-w-lg">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Footage Indexed!</h3>
          <p className="text-muted-foreground text-sm mb-6">Enter case details below to start the investigation.</p>
          
          <div className="w-full space-y-4 text-left mb-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground ml-1">Case Name</label>
              <input
                type="text"
                value={newCaseName}
                onChange={(e) => setNewCaseName(e.target.value)}
                placeholder="e.g., 'Robbery at Main Street Bank'"
                className="w-full bg-background border border-border text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground ml-1">Location of Crime</label>
              <input
                type="text"
                value={newCaseLocation}
                onChange={(e) => setNewCaseLocation(e.target.value)}
                placeholder="e.g., '123 Main St, Anytown'"
                className="w-full bg-background border border-border text-foreground p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

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
          <p className="text-xs text-muted-foreground">This may take a moment...</p>
        </div>
      )}

      {processingStatus === 'error' && (
        <div className="flex flex-col items-center text-destructive">
           <AlertTriangle size={32} className="mb-2" />
           <p>Failed to process video. Please try a different file.</p>
           <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Try Again</button>
        </div>
      )}
    </div>
  </div>
);

const SemanticSearchView = ({ isSearching, setIsSearching, searchResults, setSearchResults, videoSrc, videoFile, onAddCase }: { isSearching: boolean, setIsSearching: (isSearching: boolean) => void, searchResults: any[], setSearchResults: (results: any[]) => void, videoSrc: string | null, videoFile: File | null, onAddCase: (event: any) => void }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({ variant: 'destructive', title: "No Video", description: "Please upload and process a video first." });
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const videoDataUri = await fileToDataUri(videoFile);
      const result = await semanticVideoSearch({ videoDataUri, query });
      setSearchResults(result.results || []);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      toast({ variant: 'destructive', title: "Analysis Failed", description: err.message });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleEventClick = ( (timeInSeconds: number) => {
    setCurrentTime(timeInSeconds);
    setIsPlaying(true);
  });

  return (
    <div className="h-full flex flex-col">
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
                 <p>Sending video to Gemini...</p>
                 <p className="text-xs mt-2 opacity-50">Analyzing visual context</p>
               </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <div key={idx} className="bg-secondary p-3 rounded-lg border border-border hover:border-primary group transition-all">
                  <div onClick={() => handleEventClick(res.startTime)} className="cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-primary font-mono text-sm font-bold">{new Date(res.startTime * 1000).toISOString().substr(14, 5)} - {new Date(res.endTime * 1000).toISOString().substr(14, 5)}</span>
                      <span className="text-[10px] bg-background px-1.5 py-0.5 rounded text-muted-foreground">Event</span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{res.description}</p>
                  </div>
                   <button onClick={() => onAddCase(res)} className="w-full text-xs mt-2 p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                     <PlusCircle size={14} /> Add to Cases
                   </button>
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
               {videoFile ? `Loaded video: ${videoFile.name}.` : 'Waiting for video upload...'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimilarityView = ({ videoFile }: { videoFile: File | null }) => {
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
        if (!suspectImg) {
            toast({ variant: 'destructive', title: "Missing Input", description: "Please upload a suspect image." });
            return;
        }
        if (!videoFile) {
            toast({ variant: 'destructive', title: "Missing Video", description: "Please upload a video on the Dashboard tab first." });
            return;
        }

        setIsAnalyzing(true);
        setMatches([]);
        try {
            const videoDataUri = await fileToDataUri(videoFile);
            const result = await similaritySearch({ referenceImage: suspectImg, videoDataUri });
            setMatches(result.results || []);
        } catch (err: any) {
            toast({ variant: 'destructive', title: "Analysis Failed", description: err.message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-6 h-full">
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden aspect-square">
                        {suspectImg ? (
                            <img src={suspectImg} alt="Suspect" className="absolute inset-0 w-full h-full object-cover" />
                        ) : null}
                         <div className={`relative z-10 flex flex-col items-center text-center transition-opacity ${suspectImg ? 'opacity-0 hover:opacity-100' : 'opacity-100'} bg-black/50 p-4 rounded-lg`}>
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
                        disabled={isAnalyzing || !suspectImg}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-secondary text-white rounded-xl font-bold transition-all flex items-center justify-center"
                    >
                        {isAnalyzing ? <Loader className="animate-spin mr-2" /> : <Search className="mr-2" />}
                        Run Comparison
                    </button>
                </div>

                <div className="flex-1 bg-card/50 rounded-xl border border-border p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                        <User size={20} className="mr-2 text-purple-400" />
                        {isAnalyzing ? "Scanning available footage..." : `Matches Found (${matches.length})`}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.map((match, idx) => (
                            <div key={idx} className="bg-secondary rounded-lg overflow-hidden border border-border group">
                                <div className="aspect-video bg-background overflow-hidden">
                                   <img src={match.matchImage} alt={`Match at ${match.timestamp}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-foreground text-sm font-medium">Found at {match.timestamp}</span>
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">{match.confidence}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Video: {match.videoName}</p>

                                </div>
                            </div>
                        ))}
                        {!isAnalyzing && matches.length === 0 && (
                            <p className="text-muted-foreground text-sm col-span-full text-center py-10">Upload a suspect photo and run the comparison to see results across all indexed video footage.</p>
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


const CaseLinkingView = ({ cases, onLinkCases, linkingResults, isLinking, onUpdateCase, onRemoveCase }: { cases: any[], onLinkCases: () => void, linkingResults: any, isLinking: boolean, onUpdateCase: (caseId: string, updates: any) => void, onRemoveCase: (caseId: string) => void }) => (
  <div className="h-full flex flex-col">
    <div className="bg-card p-6 rounded-xl border border-border mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Case Linking Analysis</h2>
        <p className="text-muted-foreground text-sm">Find connections between the current case and past incidents.</p>
      </div>
      <button 
        onClick={onLinkCases}
        disabled={isLinking || cases.length < 2}
        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-secondary text-white rounded-lg font-bold transition-all flex items-center"
      >
        {isLinking ? <Loader className="animate-spin mr-2" /> : <Network className="mr-2" />}
        Analyze Links
      </button>
    </div>

    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
      <div className="bg-card/50 rounded-xl border border-border overflow-y-auto">
        <h3 className="font-semibold text-foreground p-4 border-b border-border sticky top-0 bg-card/90 backdrop-blur z-10">Case Files</h3>
        <div className="p-4 space-y-4">
          {cases.map((c, i) => (
            <div key={c.caseId} className={`p-4 rounded-lg border ${i === 0 ? 'border-primary/50 bg-primary/10' : 'border-border bg-secondary'}`}>
              <div className="flex justify-between items-start">
                <input 
                   defaultValue={c.caseName}
                   onBlur={(e) => onUpdateCase(c.caseId, { caseName: e.target.value })}
                   className={`font-bold text-lg bg-transparent border-0 p-0 focus:ring-0 focus:outline-none w-full ${i===0 ? 'text-primary' : 'text-foreground'}`}
                />
                 <button onClick={() => onRemoveCase(c.caseId)} className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                    <Trash2 size={16} />
                  </button>
              </div>

              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={12}/>
                    <ClientOnlyTimestamp timestamp={c.timestamp} />
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12}/>
                     <input 
                       defaultValue={c.place}
                       onBlur={(e) => onUpdateCase(c.caseId, { place: e.target.value })}
                       className="bg-transparent border-0 p-0 focus:ring-0 focus:outline-none w-full text-xs text-muted-foreground"
                    />
                  </div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2 mb-2">{c.description}</p>
              
              <div className="flex flex-wrap gap-2 text-xs mt-3">
                <span className="font-semibold text-foreground text-xs">People:</span>
                {c.relevantPeople.map((p:string, pi:number) => <span key={pi} className="bg-background px-2 py-1 rounded">{p}</span>)}
                 {c.relevantPeople.length === 0 && <span className="text-muted-foreground italic">None</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs mt-2">
                <span className="font-semibold text-foreground text-xs">Objects:</span>
                {c.relevantObjects.map((o:string, oi:number) => <span key={oi} className="bg-background px-2 py-1 rounded">{o}</span>)}
                {c.relevantObjects.length === 0 && <span className="text-muted-foreground italic">None</span>}
              </div>
            </div>
          ))}
           {cases.length === 0 && (
             <div className="p-8 text-center text-muted-foreground text-sm">
                No cases created. Add events from the Semantic Search tab or create a new one to start.
              </div>
            )}
        </div>
      </div>
      
      <div className="bg-card/50 rounded-xl border border-border overflow-y-auto">
        <h3 className="font-semibold text-foreground p-4 border-b border-border sticky top-0 bg-card/90 backdrop-blur z-10">Linking Analysis Results</h3>
        <div className="p-4">
          {isLinking ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader className="animate-spin w-8 h-8 text-yellow-500 mx-auto mb-4" />
              <p>Gemini is analyzing connections...</p>
            </div>
          ) : linkingResults.links && linkingResults.links.length > 0 ? (
            linkingResults.links.map((link: any, idx: number) => (
              <div key={idx} className="mb-4 bg-secondary p-4 rounded-lg border border-border">
                <p className="text-foreground"><strong className="text-yellow-400">Link Found:</strong> Connects to <strong className="font-mono">{link.linkedCaseId}</strong>.</p>
                <p className="text-muted-foreground text-sm mt-1"><strong>Reason:</strong> {link.reason}</p>
              </div>
            ))
          ) : (
             <div className="p-8 text-center text-muted-foreground text-sm">
                No links found or analysis not run.
              </div>
          )}
        </div>
      </div>
    </div>
  </div>
);


const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);
  
  const [files, setFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState('idle');

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Case Linking Data
  const [cases, setCases] = useState<any[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [linkingResults, setLinkingResults] = useState<any>({});
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseLocation, setNewCaseLocation] = useState('');
  
  const { toast } = useToast();

  // Load cases from localStorage on mount
  useEffect(() => {
    const savedCases = localStorage.getItem('insightwatch-cases');
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      // Default cases if nothing is saved
      setCases([
        { caseId: 'CASE-002', caseName: 'Stolen Wallet Incident', timestamp: '2023-10-26T10:00:00Z', place: 'Main St. & 2nd Ave', description: 'Previous report of a stolen wallet.', relevantObjects: ['Backpack', 'Sunglasses'], relevantPeople: ['Person B'], videoSegments: ['cam3_10-00.mp4'] },
        { caseId: 'CASE-001', caseName: 'Prior Sighting of Individual', timestamp: '2023-10-19T14:30:00Z', place: 'West End Plaza', description: 'Individual matching suspect description seen a week ago.', relevantObjects: ['Cap'], relevantPeople: ['Person A'], videoSegments: ['cam2_15-30.mp4'] }
      ]);
    }
  }, []);

  // Save cases to localStorage whenever they change
  useEffect(() => {
    if (cases.length > 0) {
      localStorage.setItem('insightwatch-cases', JSON.stringify(cases));
    }
  }, [cases]);


  const handleAddCamera = () => {
    setFiles(prevFiles => [...prevFiles, null]);
  };

  const handleFileChange = (index: number, file: File) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);

    if(index === 0 && file) {
      handleVideoProcess(file);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    if (index === 0) { // If removing the primary video
      resetDashboard();
    } else {
      newFiles.splice(index, 1);
      setFiles(newFiles);
    }
  };

  const resetDashboard = () => {
    setFiles(Array(5).fill(null));
    setVideoSrc(null);
    setVideoFile(null);
    setProcessingStatus('idle');
    setNewCaseName('');
    setNewCaseLocation('');
  };

  const handleVideoProcess = async (file: File) => {
    if (!file) return;
    setVideoFile(file);
    setVideoSrc(URL.createObjectURL(file));
    setNewCaseName(`Case from ${file.name}`);
    setNewCaseLocation('Unknown');
    setProcessingStatus('ready');
  };

  const handleLinkCases = async () => {
    if (cases.length < 2) {
      toast({ variant: 'destructive', title: 'Not Enough Cases', description: 'Need at least two cases to run linking analysis.' });
      return;
    }
    setIsLinking(true);
    setLinkingResults({});
    try {
        const result = await linkCases({
            newCase: cases[0],
            pastCases: cases.slice(1)
        });
        setLinkingResults(result);
        if (result.links?.length > 0) {
            toast({ title: 'Links Found!', description: `Found ${result.links.length} potential connection(s).` });
        } else {
             toast({ title: 'No Links Found', description: 'No connections identified between the newest case and past incidents.' });
        }
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Linking Failed', description: e.message });
    } finally {
        setIsLinking(false);
    }
  }

  const handleAddCase = (event: any) => {
    const newCase = {
      caseId: `CASE-${String(Date.now()).slice(-4)}`,
      caseName: 'New Case from Event',
      timestamp: new Date().toISOString(),
      place: 'Location Unknown',
      description: event.description,
      relevantObjects: [], // Can be enhanced later
      relevantPeople: [], // Can be enhanced later
      videoSegments: [videoFile?.name || 'unknown_video']
    };
    setCases(prevCases => [newCase, ...prevCases]);
    toast({
      title: "Case Created",
      description: `New case "${newCase.caseId}" has been added.`,
    });
    handleTabChange('casetracking', true);
  };

  const handleNewCase = () => {
    resetDashboard();
    handleTabChange('dashboard', true);
  };

  const handleStartInvestigation = () => {
    const newCase = {
      caseId: `CASE-${String(Date.now()).slice(-4)}`,
      caseName: newCaseName || 'Untitled Case',
      timestamp: new Date().toISOString(),
      place: newCaseLocation || 'Unknown Location',
      description: `Case created from video upload: ${videoFile?.name || 'N/A'}`,
      relevantObjects: [],
      relevantPeople: [],
      videoSegments: [videoFile?.name || 'unknown_video'],
    };
    setCases(prevCases => [newCase, ...prevCases]);
    toast({
      title: "Case Created",
      description: `New case "${newCase.caseName}" has been added.`,
    });
    handleTabChange('semantic', true);
  };

  const handleUpdateCase = (caseId: string, updates: any) => {
    setCases(prevCases => prevCases.map(c => c.caseId === caseId ? { ...c, ...updates } : c));
  };

  const handleRemoveCase = (caseId: string) => {
    setCases(prevCases => prevCases.filter(c => c.caseId !== caseId));
    toast({
      title: "Case Removed",
      description: `Case "${caseId}" has been deleted.`,
    });
  };

  const handleTabChange = (newTab: string, newNavigationEvent = false) => {
    if (newTab !== activeTab) {
      if (newNavigationEvent) {
        setTabHistory(prev => [...prev, newTab]);
      } else {
        const newHistory = [...tabHistory];
        newHistory[newHistory.length - 1] = newTab;
        setTabHistory(newHistory);
      }
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop();
      const previousTab = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(previousTab);
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
            <h1 className="font-bold text-foreground leading-none">InsightWatch</h1>
            <span className="text-[10px] text-primary tracking-wider">GEMINI POWERED</span>
          </div>
        </div>

        <nav className="flex-1">
          <SidebarItem icon={Activity} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard', true)} />
          <SidebarItem icon={Search} label="Semantic Search" active={activeTab === 'semantic'} onClick={() => handleTabChange('semantic', true)} />
          <SidebarItem icon={User} label="Similarity Search" active={activeTab === 'similarity'} onClick={() => handleTabChange('similarity', true)} />
          <SidebarItem icon={CaseSensitive} label="Case Management" active={activeTab === 'casetracking'} onClick={() => handleTabChange('casetracking', true)} />
        </nav>

        <div className="mt-auto space-y-4">
           <div className="bg-secondary/50 p-4 rounded-xl border border-border">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
               <div>
                 <p className="text-xs font-bold text-foreground">Investigator</p>
                 <p className="text-[10px] text-muted-foreground">{videoFile ? 'System Ready' : 'Idle'}</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {tabHistory.length > 1 && (
              <button onClick={handleGoBack} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground capitalize">{activeTab.replace('casetracking', 'Case Management')}</h2>
          </div>
          {videoFile && (
             <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
               Video Loaded: {videoFile.name}
             </span>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background">
          <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            <DashboardView 
              processingStatus={processingStatus} 
              onStartSearch={handleStartInvestigation}
              files={files}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              onAddCamera={handleAddCamera}
              onNewCase={handleNewCase}
              newCaseName={newCaseName}
              setNewCaseName={setNewCaseName}
              newCaseLocation={newCaseLocation}
              setNewCaseLocation={setNewCaseLocation}
            />
          </div>
          <div style={{ display: activeTab === 'semantic' ? 'block' : 'none' }}>
            <SemanticSearchView 
              isSearching={isSearching} 
              setIsSearching={setIsSearching} 
              searchResults={searchResults} 
              setSearchResults={setSearchResults}
              videoSrc={videoSrc}
              videoFile={videoFile}
              onAddCase={handleAddCase}
            />
          </div>
          <div style={{ display: activeTab === 'similarity' ? 'block' : 'none' }}>
            <SimilarityView videoFile={videoFile} />
          </div>
          <div style={{ display: activeTab === 'casetracking' ? 'block' : 'none' }}>
            <CaseLinkingView cases={cases} onLinkCases={handleLinkCases} linkingResults={linkingResults} isLinking={isLinking} onUpdateCase={handleUpdateCase} onRemoveCase={handleRemoveCase} />
          </div>
        </main>
      </div>

    </div>
  );
};

export default App;

    