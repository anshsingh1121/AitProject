import React, { useState, useEffect } from 'react';
import { toast } from "sonner";

import Header from '../components/Header';
import SourceSection from '../components/SourceSection';
import AudioPlayer from '../components/AudioPlayer';
import { convertTextToSpeech, uploadFileForConversion } from '../utils/audioUtils';

interface SourceFile {
  id: string;
  name: string;
  content: string;
  audioUrl?: string;
  transcriptUrl?: string;
  title?: string;
  requestId?: string;
}

const Index = () => {
  // 🔹 Optional demo files — include only if needed
  const includeDemoAudio = true;           // set to false to disable demo
  const includeRegionalAudio = true;       // set to false to disable regional audio

  // 🔹 Build initial file list conditionally
  const initialFiles: SourceFile[] = [];
  if (includeDemoAudio) {
    initialFiles.push({
      id: '1',
      name: 'DEMO AUDIO',
      content: 'This is a demo audio file with pre-loaded content.',
      audioUrl: 'https://res.cloudinary.com/dpyhcwi93/video/upload/v1743317667/combined_Conversation_vzkmvp.mp3'
    });
  }

  if (includeRegionalAudio) {
    initialFiles.push({
      id: '2',
      name: 'Regional Language Audio',
      content: 'Regional language narration',
      audioUrl: 'https://res.cloudinary.com/dpyhcwi93/video/upload/v1762101494/output_fprpaf.mp3'
    });
  }

  const [files, setFiles] = useState<SourceFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>(initialFiles[0]?.id || null); // 🔹 handle empty case
  const [audioUrl, setAudioUrl] = useState<string | null>(initialFiles[0]?.audioUrl || null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (files.length === 0) return;

    // 🔹 automatically pick last audio file if available
    const audioFiles = files.filter(file => file.audioUrl);
    if (audioFiles.length > 0) {
      const lastAudioFile = audioFiles[audioFiles.length - 1];
      setActiveFileId(lastAudioFile.id);
      setAudioUrl(lastAudioFile.audioUrl || null);
    }
  }, [files]);

  const handleFileSelect = async (fileId: string) => {
    setActiveFileId(fileId);
    const selectedFile = files.find(file => file.id === fileId);
    if (!selectedFile) return;

    if (selectedFile.audioUrl) {
      setIsConverting(false);
      setAudioUrl(selectedFile.audioUrl);
      return;
    }

    setIsConverting(true);
    setAudioUrl(null);

    try {
      const result = await convertTextToSpeech(selectedFile.content);
      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl);
      } else {
        toast.error(result.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Error during conversion:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsConverting(true);
      setAudioUrl(null);

      // Upload file to the API
      const result = await uploadFileForConversion(file);

      if (result.success && result.audioUrl) {
        const newFile: SourceFile = {
          id: Date.now().toString(),
          name: file.name,
          content: result.title || file.name,
          audioUrl: result.audioUrl,
          transcriptUrl: result.transcriptUrl,
          title: result.title,
          requestId: result.requestId
        };

        setFiles(prevFiles => [...prevFiles, newFile]);
        setActiveFileId(newFile.id);
        setAudioUrl(result.audioUrl);

        toast.success(`${file.name} converted successfully!`);
      } else {
        toast.error(result.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
    } finally {
      setIsConverting(false);
    }
  };

  const handleAddAudioUrl = (url: string, name: string) => {
    try {
      new URL(url);

      const newFile: SourceFile = {
        id: Date.now().toString(),
        name,
        content: `External audio from ${url}`,
        audioUrl: url
      };

      setFiles(prevFiles => [...prevFiles, newFile]);
      setActiveFileId(newFile.id);
      setAudioUrl(url);

      toast.success(`Added "${name}" successfully!`);
    } catch (error) {
      console.error('Invalid URL:', error);
      toast.error('Please enter a valid audio URL');
    }
  };

  const activeFile = activeFileId ? files.find(file => file.id === activeFileId) : null;
  const activeFileName = activeFile?.name || 'Audio';
  const activeContent = activeFile?.content || '';
  const activeTranscriptUrl = activeFile?.transcriptUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-podcast-light">
      <div className="max-w-md mx-auto p-6">
        <Header />

        <main>
          <SourceSection
            files={files}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onFileUpload={handleFileUpload}
            onAddAudioUrl={handleAddAudioUrl}
          />

          <AudioPlayer
            audioUrl={audioUrl}
            fileName={activeFileName}
            isLoading={isConverting}
            subtitles={activeContent}
            transcriptUrl={activeTranscriptUrl}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
