'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Bell,
  Home,
  LineChart,
  Package2,
  Search,
  Users,
  FileUp,
  Link,
  Loader2,
  Video,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import type { ChangeEvent } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from './icons';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { pastCases } from '@/lib/data';
import type {
  CaseDetails,
  CaseLink,
  SemanticSearchResult,
  SimilarityResult,
} from '@/lib/types';
import Timeline from './timeline';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { semanticVideoSearch } from '@/ai/flows/semantic-video-search';
import { similaritySearch } from '@/ai/flows/similarity-search';
import { linkCases } from '@/ai/flows/case-linking';
import { fileToDataUri } from '@/lib/utils';

function SemanticSearchPanel() {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<SemanticSearchResult[]>([]);
  const cctvImage = PlaceHolderImages.find(img => img.id === 'cctv-thumbnail-1');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFile(e.target.files[0]);
      setResults([]);
    }
  };

  const handleSearch = async () => {
    if (!videoFile) {
      toast({ variant: 'destructive', title: 'No Video File', description: 'Please upload a video file to search.' });
      return;
    }
    if (!query) {
      toast({ variant: 'destructive', title: 'No Query', description: 'Please enter a search query.' });
      return;
    }
    setIsLoading(true);
    setResults([]);
    try {
      const videoDataUri = await fileToDataUri(videoFile);
      const response = await semanticVideoSearch({ videoDataUri, query });
      setResults(response.results);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Search Failed', description: 'An error occurred during the search.' });
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Video Search</CardTitle>
        <CardDescription>Search CCTV footage using natural language queries.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            {!videoFile && cctvImage && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Upload a video</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Upload a CCTV video file to start your investigation.</p>
                    <Button asChild size="sm" className="mt-4">
                        <label htmlFor="video-upload">
                        <FileUp className="mr-2 h-4 w-4" /> Upload Video
                        <Input id="video-upload" type="file" accept="video/*" className="sr-only" onChange={handleFileChange} />
                        </label>
                    </Button>
                </div>
            )}
            {videoFile && cctvImage && (
                <div className="relative">
                    <Image
                        src={cctvImage.imageUrl}
                        alt="CCTV thumbnail"
                        width={600}
                        height={400}
                        data-ai-hint={cctvImage.imageHint}
                        className="w-full rounded-lg object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                        {videoFile.name}
                    </div>
                </div>
            )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="e.g., 'Find every moment a person with a red jacket appears'" 
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!videoFile}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSearch} disabled={isLoading || !videoFile}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </CardFooter>
      {(isLoading || results.length > 0) && (
        <CardContent>
            <h3 className="text-lg font-semibold mb-4">Results</h3>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4" />
                </div>
            ) : (
                <ul className="space-y-3">
                    {results.map((result, index) => (
                    <li key={index} className="flex items-center gap-4 rounded-md border p-3">
                        <FileCheck2 className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                            <p className="font-medium">{result.description}</p>
                            <p className="text-sm text-muted-foreground">
                                Timestamp: {result.startTime}s - {result.endTime}s
                            </p>
                        </div>
                    </li>
                    ))}
                </ul>
            )}
        </CardContent>
      )}
    </Card>
  );
}


function SimilaritySearchPanel() {
    const { toast } = useToast();
    const [refImage, setRefImage] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [results, setResults] = React.useState<SimilarityResult[]>([]);
    const suspectImage = PlaceHolderImages.find(img => img.id === 'suspect-1');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setRefImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults([]);
        }
    };

    const handleSearch = async () => {
        if (!refImage) {
            toast({ variant: 'destructive', title: 'No Image', description: 'Please upload a reference image.' });
            return;
        }
        setIsLoading(true);
        setResults([]);
        try {
            const referenceImage = await fileToDataUri(refImage);
            const response = await similaritySearch({ referenceImage });
            const eventImages = PlaceHolderImages.filter(img => img.id.startsWith('event-'));
            const resultsWithImages = response.results.map((result, i) => ({
                ...result,
                imageUrl: eventImages[i % eventImages.length].imageUrl,
                imageHint: eventImages[i % eventImages.length].imageHint,
            })).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setResults(resultsWithImages);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Search Failed', description: 'An error occurred during the similarity search.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Similarity Search</CardTitle>
                    <CardDescription>Upload a reference image to find all appearances of that person or object.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center h-64">
                        {previewUrl ? (
                            <Image src={previewUrl} alt="Reference preview" width={150} height={150} className="h-full w-auto object-contain rounded-lg"/>
                        ) : suspectImage ? (
                            <Image src={suspectImage.imageUrl} alt="Suspect placeholder" width={150} height={150} data-ai-hint={suspectImage.imageHint} className="h-full w-auto object-contain rounded-lg opacity-50"/>
                        ) : (
                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        )}
                        <Button asChild size="sm" className="mt-4">
                            <label htmlFor="image-upload">
                                <FileUp className="mr-2 h-4 w-4" /> {refImage ? "Change Image" : "Upload Image"}
                                <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                            </label>
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSearch} disabled={isLoading || !refImage}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Searching...' : 'Find Matches'}
                    </Button>
                </CardFooter>
            </Card>
            {isLoading ? (
                 <Card>
                    <CardHeader><CardTitle>Appearance Timeline</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <Skeleton className="h-16 w-16 rounded-lg" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <Skeleton className="h-16 w-16 rounded-lg" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Timeline results={results} />
            )}
        </div>
    );
}

function CaseLinkingPanel() {
    const { toast } = useToast();
    const [newCase, setNewCase] = React.useState<Omit<CaseDetails, 'caseId'>>({ description: '', relevantObjects: [], relevantPeople: [] });
    const [isLoading, setIsLoading] = React.useState(false);
    const [links, setLinks] = React.useState<CaseLink[]>([]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCase(prev => ({ ...prev, [name]: name.startsWith('relevant') ? value.split(',').map(s => s.trim()) : value }));
    };

    const handleLinkCases = async () => {
        if (!newCase.description) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a case description.' });
            return;
        }
        setIsLoading(true);
        setLinks([]);
        try {
            const caseDetails: CaseDetails = { ...newCase, caseId: `case${Date.now()}`, videoSegments: [] };
            const response = await linkCases({ newCase: caseDetails, pastCases });
            setLinks(response.links);
        } catch(error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: 'An error occurred while linking cases.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Case Management</CardTitle>
                    <CardDescription>Create a new case and find links to past incidents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="description" className="text-sm font-medium">New Case Description</label>
                        <Textarea id="description" name="description" placeholder="e.g., Theft of a blue bag from the west wing..." value={newCase.description} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                        <label htmlFor="relevantPeople" className="text-sm font-medium">Relevant People</label>
                        <Input id="relevantPeople" name="relevantPeople" placeholder="e.g., person in blue jacket, man with glasses" value={newCase.relevantPeople.join(', ')} onChange={handleInputChange} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Separate with commas.</p>
                    </div>
                    <div>
                        <label htmlFor="relevantObjects" className="text-sm font-medium">Relevant Objects</label>
                        <Input id="relevantObjects" name="relevantObjects" placeholder="e.g., red backpack, silver sedan" value={newCase.relevantObjects.join(', ')} onChange={handleInputChange} className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Separate with commas.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLinkCases} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Analyzing...' : 'Find Linked Cases'}
                    </Button>
                </CardFooter>
                 {links.length > 0 && (
                    <CardContent>
                        <Alert>
                            <Link className="h-4 w-4" />
                            <AlertTitle>Potential Links Found!</AlertTitle>
                            <AlertDescription>
                                <ul className="mt-2 space-y-2">
                                    {links.map(link => (
                                        <li key={link.linkedCaseId}>
                                            <strong>Case {link.linkedCaseId}:</strong> {link.reason}
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                )}
                 {isLoading && (
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                )}
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Past Cases</CardTitle>
                    <CardDescription>A log of previously analyzed incidents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pastCases.map(c => (
                        <div key={c.caseId} className="rounded-lg border bg-card p-3">
                            <p className="text-sm font-semibold text-primary">{c.caseId}</p>
                            <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">InsightWatch</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="h-4 w-4" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LineChart className="h-4 w-4" />
                  Analytics
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/avatar/40/40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Tabs defaultValue="semantic-search">
              <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                <TabsTrigger value="semantic-search">Semantic Search</TabsTrigger>
                <TabsTrigger value="similarity-search">Similarity Search</TabsTrigger>
                <TabsTrigger value="case-linking">Case Management</TabsTrigger>
              </TabsList>
              <TabsContent value="semantic-search">
                <SemanticSearchPanel />
              </TabsContent>
              <TabsContent value="similarity-search">
                <SimilaritySearchPanel />
              </TabsContent>
              <TabsContent value="case-linking">
                <CaseLinkingPanel />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
