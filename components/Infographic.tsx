/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Sparkles, Edit3, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface InfographicProps {
  image: GeneratedImage;
  onEdit: (prompt: string) => void;
  isEditing: boolean;
}

const Infographic: React.FC<InfographicProps> = ({ image, onEdit, isEditing }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    onEdit(editPrompt);
    setEditPrompt('');
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setZoomLevel(1);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto animate-in fade-in zoom-in duration-700 mt-8">
      
      {/* Image Container */}
      <div className="relative group w-full bg-slate-900/40 rounded-lg overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
        
        {/* C4 Tech Markers */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand-orange/50 z-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-brand-orange/50 z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-brand-orange/50 z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand-orange/50 z-20 pointer-events-none"></div>
        
        {/* Scanline Overlay on Image */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

        <img 
          src={image.data} 
          alt={image.prompt} 
          onClick={() => setIsFullscreen(true)}
          className="w-full h-auto object-contain max-h-[80vh] bg-checkered relative z-0 cursor-zoom-in"
        />
        
        <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30">
          <button 
            onClick={() => setIsFullscreen(true)}
            className="bg-black/60 backdrop-blur-md text-white p-3 rounded shadow-lg hover:bg-brand-orange hover:text-white transition-colors border border-white/10 block"
            title="Fullscreen View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <a 
            href={image.data} 
            download={`infographic-${image.id}.png`}
            className="bg-black/60 backdrop-blur-md text-white p-3 rounded shadow-lg hover:bg-brand-orange hover:text-white transition-colors border border-white/10 block"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Edit Bar */}
      <div className="w-full max-w-3xl -mt-6 sm:-mt-8 relative z-40 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl p-3 sm:p-2 sm:pr-3 rounded shadow-2xl border border-brand-orange/30 flex flex-col sm:flex-row gap-2 items-center">
            <div className="pl-4 text-brand-orange hidden sm:block">
                <Edit3 className="w-5 h-5" />
            </div>
            <form onSubmit={handleSubmit} className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="ENTER MODIFICATION PARAMETERS..."
                    className="flex-1 bg-black/40 sm:bg-transparent border border-white/10 sm:border-none rounded sm:rounded-none focus:ring-0 text-white placeholder:text-slate-500 px-4 py-3 sm:px-2 sm:py-2 font-medium text-sm font-sans"
                    disabled={isEditing}
                />
                <div className="w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={isEditing || !editPrompt.trim()}
                        className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all tracking-wider ${
                            isEditing || !editPrompt.trim() 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-brand-gradient text-white hover:brightness-110 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                        }`}
                    >
                        {isEditing ? (
                            <span className="animate-spin w-4 h-4 block border-2 border-white/30 border-t-white rounded-full"></span>
                        ) : (
                            <>
                                <span>ENHANCE</span>
                                <Sparkles className="w-3 h-3" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2 px-4">
        <p className="text-[10px] text-brand-orange font-orbitron tracking-widest uppercase opacity-80">
            CURRENT VISUALIZATION: {image.prompt}
        </p>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto bg-slate-900/50 backdrop-blur-md p-1 rounded border border-white/10">
                    <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded text-slate-200 transition-colors" title="Zoom Out">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button onClick={handleResetZoom} className="p-2 hover:bg-white/10 rounded text-slate-200 transition-colors" title="Reset Zoom">
                        <span className="text-xs font-bold font-orbitron">{Math.round(zoomLevel * 100)}%</span>
                    </button>
                    <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded text-slate-200 transition-colors" title="Zoom In">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                <button 
                    onClick={handleCloseFullscreen}
                    className="pointer-events-auto p-3 bg-brand-orange hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
                <img 
                    src={image.data} 
                    alt={image.prompt}
                    style={{ 
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.2s ease-out'
                    }}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded border border-white/5 origin-center"
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default Infographic;