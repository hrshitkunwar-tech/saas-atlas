'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, ExternalLink, Zap, Code, Grid3x3, ChevronRight, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';

interface SearchResult {
  company: Company;
  relevance: number;
}

const intentCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'api', label: 'API & SDK', icon: Code },
  { id: 'integration', label: 'Integrations', icon: Grid3x3 },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
];

export function CompanyDirectory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedIntent, setSelectedIntent] = useState('getting-started');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    const { data, error } = await supabase.from('companies').select('*').order('name');
    if (error) console.error('Error:', error);
    else setCompanies(data || []);
    setLoading(false);
  }

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = companies
      .map(company => {
        let relevance = 0;
        if (company.name.toLowerCase().includes(lowerQuery)) {
          relevance = 100;
        } else if (company.category.toLowerCase().includes(lowerQuery)) {
          relevance = 75;
        } else if (company.description?.toLowerCase().includes(lowerQuery)) {
          relevance = 50;
        }
        return { company, relevance };
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);

    setSearchResults(results);
    setShowResults(true);
  };

  const getLogoUrl = (company: Company) => {
    const domain = company.docs_url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    return `https://logo.clearbit.com/${domain}`;
  };

  const categories = useMemo(() => [...new Set(companies.map(c => c.category))], [companies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SaaS Atlas</h1>
              <p className="text-xs text-gray-500">{companies.length} products</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products, errors, or tasks..."
              value={searchQuery}
              onChange={(e) => performSearch(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchResults.length === 0 && searchQuery.trim() !== '' && (
                  <div className="p-8 text-center text-gray-500">No results found</div>
                )}
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCompany(result.company);
                      setShowResults(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0"
                  >
                    <p className="font-medium text-gray-900">{result.company.name}</p>
                    <p className="text-sm text-gray-500">{result.company.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!selectedCompany ? (
          <>
            {searchQuery === '' && (
              <div className="space-y-12">
                <div className="text-center py-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Find support for any SaaS</h2>
                  <p className="text-gray-600 mb-8">Search documentation across 300+ products</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.slice(0, 6).map(cat => (
                      <button
                        key={cat}
                        onClick={() => performSearch(cat)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md"
                      >
                        <p className="font-semibold text-gray-900">{cat}</p>
                        <p className="text-sm text-gray-500">{companies.filter(c => c.category === cat).length} products</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Results: {searchQuery}</h2>
                <div className="grid gap-4">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCompany(result.company)}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md text-left"
                    >
                      <h3 className="text-lg font-bold text-gray-900">{result.company.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">{result.company.category}</p>
                      {result.company.description && (
                        <p className="text-sm text-gray-600 mt-2">{result.company.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-blue-600 font-medium mb-6"
              >
                Back to search
              </button>

              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">{selectedCompany.name}</h1>
                <p className="text-gray-600 mt-2">{selectedCompany.category}</p>
                {selectedCompany.description && (
                  <p className="text-gray-700 mt-4">{selectedCompany.description}</p>
                )}
                
                  href={selectedCompany.docs_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Docs
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <p className="text-sm text-gray-600 font-semibold uppercase mb-4">What are you trying to do?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {intentCategories.map(intent => {
                    const Icon = intent.icon;
                    return (
                      <button
                        key={intent.id}
                        onClick={() => setSelectedIntent(intent.id)}
                        className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
                          selectedIntent === intent.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{intent.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 border border-gray-200 space-y-8">
                {[
                  { title: 'Getting Started', desc: 'Setup and first steps' },
                  { title: 'API & SDK', desc: 'Technical reference' },
                  { title: 'Integrations', desc: 'Connect with other tools' },
                  { title: 'Troubleshooting', desc: 'Common issues and solutions' },
                ].map((section, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-8 last:border-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{section.desc}</p>
                    
                      href={selectedCompany.docs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Details</h4>
                  <p className="text-sm text-gray-600 mb-2">Category: {selectedCompany.category}</p>
                  
                    href={selectedCompany.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs break-all"
                  >
                    {selectedCompany.docs_url}
                  </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Related</h4>
                  {companies
                    .filter(c => c.category === selectedCompany.category && c.id !== selectedCompany.id)
                    .slice(0, 5)
                    .map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCompany(c)}
                        className="w-full text-left p-2 hover:bg-blue-50 rounded text-sm text-gray-700 mb-2 last:mb-0"
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
