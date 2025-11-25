/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SearchResultItem } from '../types';
import { ExternalLink, BookOpen, Link as LinkIcon } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-3 mb-6 border-t border-white/10 pt-8">
        <div className="p-2 bg-slate-900 rounded border border-brand-orange/30 text-brand-orange shadow-sm">
            <BookOpen className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-slate-500 font-orbitron uppercase tracking-[0.2em]">Data Sources</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <a 
            key={index} 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex flex-col p-5 bg-slate-900/40 border border-white/5 rounded hover:border-brand-orange/50 hover:bg-slate-900/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] backdrop-blur-sm"
          >
            <div className="absolute top-0 left-0 w-0.5 h-full bg-brand-orange/0 group-hover:bg-brand-orange transition-all duration-300"></div>
            
            <div className="flex items-start justify-between gap-3 mb-3">
               <h4 className="font-sans font-semibold text-slate-200 group-hover:text-brand-orange transition-colors line-clamp-2 leading-tight text-sm">
                 {result.title}
               </h4>
               <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-orange flex-shrink-0 transition-colors mt-0.5" />
            </div>
            
            <div className="mt-auto flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <LinkIcon className="w-3 h-3" />
              <span className="truncate max-w-full opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                {(() => {
                  try {
                    return new URL(result.url).hostname.replace('www.', '');
                  } catch {
                    return 'External Source';
                  }
                })()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;