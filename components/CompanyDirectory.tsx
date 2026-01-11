'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, Globe, Loader, BookOpen, HelpCircle, Code, Wrench, FileText, Puzzle, MessageCircle, GraduationCap, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';

const contentTypes = [
  { id: 'all', label: 'All Resources', icon: Globe },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
  { id: 'implementation', label: 'Implementation', icon: Wrench },
  { id: 'api', label: 'API Docs', icon: Code },
  { id: 'howto', label: 'How-To Guides', icon: FileText },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
];

const resourceSections = [
  { 
    id: 'knowledge', 
    label: 'Knowledge Base', 
    icon: BookOpen, 
    description: 'Browse articles, guides, and documentation',
    paths: ['/docs', '/knowledge', '/help', '/support/articles']
  },
  { 
    id: 'community', 
    label: 'Community Forum', 
    icon: MessageCircle, 
    description: 'Connect with other users and get help',
    paths: ['/community', '/forum', '/discussions']
  },
  { 
    id: 'academy', 
    label: 'Academy & Training', 
    icon: GraduationCap, 
    description: 'Video tutorials and certification courses',
    paths: ['/academy', '/training', '/learn', '/courses']
  },
  { 
    id: 'developer', 
    label: 'Developer Documentation', 
    icon: Code, 
    description: 'API reference and technical guides',
    paths: ['/developers', '/api', '/docs/api', '/developer']
  },
  { 
    id: 'support', 
    label: 'Contact Support', 
    icon: Mail, 
    description: 'Get personalized help from support team',
    paths: ['/contact', '/support/contact', '/help/contact']
  },
];

export function CompanyDirectory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    const { data, error } = await supabase.from('companies').select('*').order('name');
    if (error) console.error('Error:', error);
    else setCompanies(data || []);
    setLoading(false);
  }

  const getLogoUrl = (company: Company) => {
    const domain = company.docs_url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    return `https://logo.clearbit.com/${domain}`;
  };

  const getResourceUrl = (company: Company, paths: string[]) => {
    const baseUrl = new URL(company.docs_url).origin;
    // Try to find the most likely path
    return `${baseUrl}${paths[0]}`;
  };

  const categories = useMemo(() => [...new Set(companies.map(c => c.category))].sort(), [companies]);

  const filteredCompanies = useMemo(() => {
    let result = companies;
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(company => 
        company.name.toLowerCase().includes(query) ||
        company.category.toLowerCase().includes(query) ||
        (company.description && company.description.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(company => company.category === selectedCategory);
    }
    
    return result;
  }, [companies, searchQuery, selectedCategory]);

  const companiesByCategory = useMemo(() => {
    const grouped: Record<string, Company[]> = {};
    filteredCompanies.forEach(company => {
      if (!grouped[company.category]) grouped[company.category] = [];
      grouped[company.category].push(company);
    });
    return grouped;
  }, [filteredCompanies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SaaS Atlas</h1>
                <p className="text-sm text-gray-600 mt-1">Knowledge for {companies.length} platforms</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{companies.length}</div>
                <div className="text-xs text-gray-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{categories.length}</div>
                <div className="text-xs text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Filter by Content Type</h2>
          <div className="grid grid-cols-7 gap-3">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedContentType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedContentType(type.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className={`text-xs font-medium text-center ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search companies by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {searchQuery ? (
              <span>Found <strong className="text-blue-600">{filteredCompanies.length}</strong> results for "{searchQuery}"</span>
            ) : (
              <span>Showing <strong className="text-blue-600">{filteredCompanies.length}</strong> of {companies.length} companies</span>
            )}
            {searchQuery && filteredCompanies.length === 0 && (
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-2 text-blue-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-lg p-16 text-center">
            <Globe className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(companiesByCategory).map(([category, categoryCompanies]) => (
              <div key={category} className="bg-white rounded-2xl border shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{category}</h2>
                    <span className="px-4 py-1 bg-white/20 text-white rounded-full text-sm font-semibold">{categoryCompanies.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-6">
                  {categoryCompanies.map(company => (
                    <div key={company.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer" onClick={() => setSelectedCompany(company)}>
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border">
                          <img src={getLogoUrl(company)} alt={company.name} className="w-full h-full object-contain p-1" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{company.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{company.category}</p>
                        </div>
                      </div>
                      {company.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>}
                      <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
                        <ArrowRight className="w-4 h-4" />View Support Resources
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setSelectedCompany(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm p-2">
                    <img src={getLogoUrl(selectedCompany)} alt={selectedCompany.name} className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{selectedCompany.name}</h2>
                    <p className="text-blue-100 text-lg">{selectedCompany.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCompany(null)} className="text-white/80 hover:text-white text-4xl leading-none">×</button>
              </div>
            </div>
            
            <div className="p-8">
              {selectedCompany.description && (
                <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <p className="text-gray-700 text-lg leading-relaxed">{selectedCompany.description}</p>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Support & Learning Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resourceSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      
                        <a key={section.id}
                        href={getResourceUrl(selectedCompany, section.paths)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all bg-white"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                              {section.label}
                              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Main Documentation Site</h3>
                <a href={selectedCompany.docs_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium group">
                  <ExternalLink className="w-5 h-5 flex-shrink-0" />
                  <span className="break-all group-hover:underline">{selectedCompany.docs_url}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
