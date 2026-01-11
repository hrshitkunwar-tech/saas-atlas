'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, ExternalLink, BookOpen, AlertCircle, Zap, Code, Grid3x3, ChevronRight, ArrowRight, Clock, Star, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';

interface SearchResult {
  company: Company;
  relevance: number;
  matchType: 'name' | 'description' | 'category';
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
  const [selectedIntent, setSelectedIntent] = useState<string>('getting-started');
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
        let matchType: 'name' | 'description' | 'category' = 'name';

        if (company.name.toLowerCase().includes(lowerQuery)) {
          relevance = 100;
          matchType = 'name';
        } else if (company.category.toLowerCase().includes(lowerQuery)) {
          relevance = 75;
          matchType = 'category';
        } else if (company.description?.toLowerCase().includes(lowerQuery)) {
          relevance = 50;
          matchType = 'description';
        }

        return { company, relevance, matchType };
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);

    setSearchResults(results);
    setShowResults(true);

    const saved = localStorage.getItem('recentSearches');
    const recent = saved ? JSON.parse(saved) : [];
    if (query.trim() && !recent.includes(query)) {
      const updated = [query, ...recent].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SaaS Atlas</h1>
                <p className="text-xs text-gray-500">{companies.length} products • {categories.length} categories</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search anything... 'stripe webhook', 'datadog setup', 'salesforce integration'"
                value={searchQuery}
                onChange={(e) => performSearch(e.target.value)}
                onFocus={() => searchQuery === '' ? setShowResults(true) : null}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchQuery.trim() === '' ? (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Try searching for:</p>
                    <div className="space-y-2">
                      {['stripe webhook', 'datadog setup', 'salesforce integration', 'slack api'].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => performSearch(example)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCompany(result.company);
                          setShowResults(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3"
                      >
                        <img
                          src={getLogoUrl(result.company)}
                          alt={result.company.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0 mt-1"
                          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{result.company.name}</p>
                            {result.relevance === 100 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Match</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{result.company.category}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!selectedCompany ? (
          <>
            {/* Empty State / Inspiration */}
            {searchQuery === '' && searchResults.length === 0 && (
              <div className="space-y-12">
                <div className="text-center py-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Find support for any SaaS tool</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    Search by product name, feature, error message, or task. Instant access to official documentation, guides, and integrations.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Stripe API setup', 'Datadog monitoring', 'HubSpot integration', 'Slack webhook'].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => performSearch(example)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Categories */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.slice(0, 6).map(cat => {
                      const count = companies.filter(c => c.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => performSearch(cat)}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left"
                        >
                          <p className="font-semibold text-gray-900">{cat}</p>
                          <p className="text-sm text-gray-500 mt-1">{count} products</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Integrations */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Integrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Salesforce', 'HubSpot', 'Slack', 'Zapier', 'Make', 'Integromat'].map((integration, idx) => (
                      <button
                        key={idx}
                        onClick={() => performSearch(integration)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all text-center"
                      >
                        <p className="font-medium text-gray-900">{integration}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Results for "<span className="text-blue-600">{searchQuery}</span>"
                  </h2>
                  <p className="text-gray-600">{searchResults.length} found</p>
                </div>

                <div className="grid gap-4">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCompany(result.company)}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={getLogoUrl(result.company)}
                          alt={result.company.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{result.company.name}</h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{result.company.category}</span>
                          </div>
                          {result.company.description && (
                            <p className="text-gray-600 text-sm mb-3">{result.company.description}</p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(result.company.docs_url, '_blank');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            View Documentation <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Product Knowledge Hub */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Header */}
              <div className="mb-8">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium mb-6 flex items-center gap-2"
                >
                  ← Back to search
                </button>

                <div className="flex items-start gap-4 mb-8">
                  <img
                    src={getLogoUrl(selectedCompany)}
                    alt={selectedCompany.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900">{selectedCompany.name}</h1>
                    <p className="text-gray-600 mt-2">{selectedCompany.category}</p>
                    {selectedCompany.description && (
                      <p className="text-gray-700 mt-4">{selectedCompany.description}</p>
                    )}
                    
                      href={selectedCompany.docs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Official Docs <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-600 font-semibold uppercase mb-4">What are you trying to do?</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {intentCategories.map(intent => {
                      const Icon = intent.icon;
                      const isSelected = selectedIntent === intent.id;
                      return (
                        <button
                          key={intent.id}
                          onClick={() => setSelectedIntent(intent.id)}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                            {intent.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-8 bg-white rounded-lg p-8 border border-gray-200">
                {[
                  { title: '📚 Getting Started', desc: 'Setup guides and first steps' },
                  { title: '⚙️ API & SDK', desc: 'Reference documentation and code examples' },
                  { title: '🔗 Integrations', desc: 'Connect with other tools' },
                  { title: '🐛 Troubleshooting', desc: 'Common errors and solutions' },
                ].map((section, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-8 last:border-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{section.desc}</p>
                    
                      href={selectedCompany.docs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      View on official docs <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Quick Info</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{selectedCompany.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Documentation</p>
                      
                        href={selectedCompany.docs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium break-all text-xs"
                      >
                        {selectedCompany.docs_url}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Related Products */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Related Products</h4>
                  <div className="space-y-2">
                    {companies
                      .filter(c => c.category === selectedCompany.category && c.id !== selectedCompany.id)
                      .slice(0, 5)
                      .map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCompany(c)}
                          className="w-full text-left p-2 hover:bg-blue-50 rounded text-sm text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
