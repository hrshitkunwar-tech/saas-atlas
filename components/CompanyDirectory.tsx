'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';

export function CompanyDirectory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from('companies').select('*').order('name');
      setCompanies(data || []);
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = query.toLowerCase();
    const results = companies.filter(
      c => c.name.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)
    );
    setSearchResults(results);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">SaaS Atlas</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {selectedCompany ? (
          <div>
            <button onClick={() => setSelectedCompany(null)} className="text-blue-600 font-medium mb-6">
              Back
            </button>
            <h2 className="text-4xl font-bold mb-4">{selectedCompany.name}</h2>
            <p className="text-gray-600 mb-4">{selectedCompany.category}</p>
            {selectedCompany.description && <p className="text-gray-700 mb-6">{selectedCompany.description}</p>}
            <a href={selectedCompany.docs_url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Docs
            </a>
          </div>
        ) : (
          <div>
            {searchQuery === '' ? (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold mb-4">Find support for any SaaS</h2>
                <p className="text-gray-600">Search documentation across {companies.length} products</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Results: {searchResults.length} found</h2>
                <div className="grid gap-4">
                  {searchResults.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => setSelectedCompany(company)}
                      className="p-6 bg-white border rounded-lg text-left hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-bold text-lg">{company.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">{company.category}</p>
                      {company.description && <p className="text-sm text-gray-600 mt-2">{company.description}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
