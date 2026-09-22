import React, { createContext, useContext, useState } from 'react';
import { ScanResponse, ScanType } from '../types/scan';
import { inspectThreat, loadMockSample } from '../services/api';

interface ScanContextType {
  currentScan: ScanResponse | null;
  isScanning: boolean;
  scanStep: number;
  inputText: string;
  inputUrl: string;
  error: string | null;
  isSafeReplyOpen: boolean;
  activeTab: ScanType;
  setInputText: (text: string) => void;
  setInputUrl: (url: string) => void;
  setError: (err: string | null) => void;
  setIsSafeReplyOpen: (open: boolean) => void;
  setActiveTab: (tab: ScanType) => void;
  loadSample: (sampleKey: 'amazon_scam' | 'rental_deposit' | 'legit_offer') => Promise<void>;
  triggerScan: () => Promise<void>;
  resetScan: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScan, setCurrentScan] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSafeReplyOpen, setIsSafeReplyOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ScanType>('text');

  const loadSample = async (sampleKey: 'amazon_scam' | 'rental_deposit' | 'legit_offer') => {
    setIsScanning(true);
    setError(null);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 200);
    const stepTimer2 = setTimeout(() => setScanStep(3), 400);

    try {
      const sampleResult = await loadMockSample(sampleKey);
      setCurrentScan(sampleResult);
      setInputText(sampleResult.raw_content || '');
      setInputUrl(sampleResult.domain_info.domain ? `https://${sampleResult.domain_info.domain}` : '');
      setActiveTab(sampleKey === 'legit_offer' ? 'text' : sampleResult.scan_type);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const triggerScan = async () => {
    if (!inputText.trim() && !inputUrl.trim()) {
      setError('Please provide text or a target URL to scan.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 200);
    const stepTimer2 = setTimeout(() => setScanStep(3), 450);

    try {
      const result = await inspectThreat({
        scan_type: activeTab,
        content: inputText,
        target_url: inputUrl,
      });
      setCurrentScan(result);
    } catch (err: any) {
      setError(err.message || 'Inspection failed');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const resetScan = () => {
    setCurrentScan(null);
    setIsScanning(false);
    setScanStep(0);
    setInputText('');
    setInputUrl('');
    setError(null);
    setIsSafeReplyOpen(false);
  };

  return (
    <ScanContext.Provider
      value={{
        currentScan,
        isScanning,
        scanStep,
        inputText,
        inputUrl,
        error,
        isSafeReplyOpen,
        activeTab,
        setInputText,
        setInputUrl,
        setError,
        setIsSafeReplyOpen,
        setActiveTab,
        loadSample,
        triggerScan,
        resetScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScanContext = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
};
