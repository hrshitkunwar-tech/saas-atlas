'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';

export function CompanyDirectory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('companies').select('*').order('name');
      setCompanies(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const search = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = q.toLowerCase();
    setSearchResults(companies.filter(c => c.name.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower)));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">SaaS Atlas - {companies.length} products</h1>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => search(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {selectedCompany ? (
          <div>
            <button onClick={() => setSelectedCompany(null)} className="text-blue-600 mb-4">Back</button>
            <h2 className="text-3xl font-bold mb-2">{selectedCompany.name}</h2>
            <p className="text-gray-600 mb-4">{selectedCompany.category}</p>
            <a href={selectedCompany.docs_url} target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded">View Docs</a>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">{searchResults.length > 0 ? 'Results' : 'All Products'}</h2>
            <div className="grid gap-2">
              {(searchResults.length > 0 ? searchResults : companies).map(c => (
                <button key={c.id} onClick={() => setSelectedCompany(c)} className="p-4 bg-white border rounded text-left hover:shadow">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.category}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
