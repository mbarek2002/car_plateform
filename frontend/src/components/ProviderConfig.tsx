import React, { useEffect, useMemo, useState } from 'react';
import { apiService, ProviderConfig as ProviderConfigType } from '../services/api';

const ProviderConfig: React.FC = () => {
  const [config, setConfig] = useState<ProviderConfigType>({
    llm_provider: '',
    embedding_provider: '',
    vectordb_provider: ''
  });
  const [initialConfig, setInitialConfig] = useState<ProviderConfigType | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingInitial(true);
        const current = await apiService.getCurrentProviders();
        if (mounted) {
          const next = {
            llm_provider: current.llm_provider || '',
            embedding_provider: current.embedding_provider || '',
            vectordb_provider: current.vectordb_provider || ''
          };
          setConfig(next);
          setInitialConfig(next);
        }
      } catch (e) {
        console.error('Failed to load current providers', e);
        if (mounted) setError('Unable to load current configuration');
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
    setSuccess(null);
    setError(null);
  };

  const isDirty = useMemo(() => {
    if (!initialConfig) return false;
    return (
      (config.llm_provider || '') !== (initialConfig.llm_provider || '') ||
      (config.embedding_provider || '') !== (initialConfig.embedding_provider || '') ||
      (config.vectordb_provider || '') !== (initialConfig.vectordb_provider || '')
    );
  }, [config, initialConfig]);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await apiService.configureProviders(config);
      setSuccess('Provider configuration updated successfully');
      setInitialConfig(config);
    } catch (err) {
      console.error(err);
      setError('Failed to update provider configuration');
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ label }: { label: string }) => (
    <span className="inline-flex items-center rounded-full bg-white/15 text-white/90 border border-white/20 px-3 py-1 text-xs">
      {label}
    </span>
  );

  const SelectField = ({
    name,
    label,
    value,
    options
  }: {
    name: keyof ProviderConfigType;
    label: string;
    value: string | undefined;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value || ''}
          onChange={handleChange}
          className="w-full appearance-none rounded-full border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
        >
          <option value="">None</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>
    </div>
  );

  const SectionCard = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-5 sm:p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Provider Settings</h1>
            <p className="text-white/80 text-sm sm:text-base mt-1">Choose default providers used across the application.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Chip label={`LLM: ${config.llm_provider || 'None'}`}/>
              <Chip label={`Embed: ${config.embedding_provider || 'None'}`}/>
              <Chip label={`VectorDB: ${config.vectordb_provider || 'None'}`}/>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingInitial || !isDirty}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none ${
              loading || loadingInitial || !isDirty
                ? 'bg-white/20 text-white/70 cursor-not-allowed'
                : 'bg-white text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            {loading ? 'Saving…' : !isDirty ? 'No changes' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      {loadingInitial ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
              <div className="h-4 w-32 bg-gray-200 rounded mb-3"/>
              <div className="h-9 w-full bg-gray-200 rounded-full"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <SectionCard title="LLM Provider" emoji="🧠">
            <SelectField
              name="llm_provider"
              label="LLM Provider"
              value={config.llm_provider || ''}
              options={[
                // { value: '', label: 'None' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'huggingface', label: 'HuggingFace' },
                { value: 'ngrok', label: 'Ngrok' }
              ]}
            />
          </SectionCard>

          <SectionCard title="Embedding Provider" emoji="🧩">
            <SelectField
              name="embedding_provider"
              label="Embedding Provider"
              value={config.embedding_provider || ''}
              options={[
                // { value: '', label: 'None' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'huggingface', label: 'HuggingFace' }
              ]}
            />
          </SectionCard>

          <SectionCard title="Vector DB Provider" emoji="🗃️">
            <SelectField
              name="vectordb_provider"
              label="Vector DB Provider"
              value={config.vectordb_provider || ''}
              options={[
                // { value: '', label: 'None' },
                { value: 'chroma', label: 'Chroma' },
                { value: 'pinecone', label: 'Pinecone' }
              ]}
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default ProviderConfig;