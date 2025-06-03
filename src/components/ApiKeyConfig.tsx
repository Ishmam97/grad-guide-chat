
import React, { useState } from 'react';
import { Key, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyConfigProps {
  onApiKeyChange: (apiKey: string) => void;
}

const ApiKeyConfig = ({ onApiKeyChange }: ApiKeyConfigProps) => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [isVisible, setIsVisible] = useState(false);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    onApiKeyChange(apiKey);
    console.log('Gemini API key saved');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center mb-3">
        <Key className="w-5 h-5 mr-2" style={{ color: '#245d7a' }} />
        <h3 className="font-semibold text-gray-800">Gemini API Configuration</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">
            API Key
          </Label>
          <Input
            id="api-key"
            type={isVisible ? "text" : "password"}
            value={apiKey}
            onChange={handleChange}
            placeholder="Enter your Gemini API key"
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="text-xs hover:underline"
            style={{ color: '#245d7a' }}
          >
            {isVisible ? 'Hide' : 'Show'} key
          </button>
          
          <Button 
            onClick={handleSave}
            size="sm"
            disabled={!apiKey.trim()}
            className="text-white hover:opacity-90"
            style={{ backgroundColor: '#245d7a' }}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfig;
