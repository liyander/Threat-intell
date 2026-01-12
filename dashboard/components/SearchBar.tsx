
'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter CVE ID (e.g. CVE-2023-44487)"
        className="w-full bg-[#050B14] border border-gray-700 text-gray-200 text-sm rounded-md py-2 pl-10 pr-4 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-600"
      />
      <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
      {isLoading && (
        <div className="absolute right-3 top-2.5">
            <Loader2 className="animate-spin text-blue-500" size={16} />
        </div>
      )}
    </form>
  );
};

export default SearchBar;
