import React from 'react';
import { ExternalLink, Droplets, Wind, Sunrise, Sunset, Calculator, Clock3, CalendarDays, Languages } from 'lucide-react';

const InformationResult = ({ action }) => {
  if (!action?.type) return null;
  const data = action.data || {};

  if (action.type === 'WEATHER') return (
    <div className="glass-card w-full rounded-[24px] border border-white/60 p-5 text-left">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-aura-text-muted">Weather</p><h3 className="mt-1 text-xl font-semibold text-aura-text-primary">{data.city}</h3><p className="text-sm capitalize text-aura-text-secondary">{data.condition}</p></div><div className="text-3xl font-semibold text-aura-primary-purple">{data.temperature}°C</div></div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-aura-text-secondary md:grid-cols-4"><span><strong className="block text-aura-text-primary">{data.feelsLike}°C</strong>Feels like</span><span><Droplets className="mr-1 inline h-3.5 w-3.5" /><strong className="text-aura-text-primary">{data.humidity}%</strong> Humidity</span><span><Wind className="mr-1 inline h-3.5 w-3.5" /><strong className="text-aura-text-primary">{data.windSpeed} km/h</strong> Wind</span><span><strong className="block text-aura-text-primary">{data.precipitation} mm</strong>Precipitation</span></div>
      <div className="mt-4 flex gap-4 text-[11px] text-aura-text-muted"><span><Sunrise className="mr-1 inline h-3.5 w-3.5" />{new Date(data.sunrise).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span><span><Sunset className="mr-1 inline h-3.5 w-3.5" />{new Date(data.sunset).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
    </div>
  );

  if (action.type === 'SEARCH') return (
    <div className="w-full space-y-2 text-left">{(data.results || []).map((result) => <article key={result.url} className="glass-card rounded-[20px] border border-white/60 p-4"><h3 className="font-medium text-aura-text-primary">{result.title}</h3><p className="mt-1 text-xs leading-relaxed text-aura-text-secondary">{result.description}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="truncate text-[10px] text-aura-text-muted">{result.source}</span><a href={result.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-aura-primary-purple">Open <ExternalLink className="h-3.5 w-3.5" /></a></div></article>)}</div>
  );

  const Icon = action.type === 'CALCULATE' ? Calculator : action.type === 'TIME' ? Clock3 : action.type === 'DATE' ? CalendarDays : Languages;
  if (['CALCULATE', 'TIME', 'DATE', 'TRANSLATE'].includes(action.type)) return <div className="glass-card flex w-full items-center gap-3 rounded-[22px] border border-white/60 p-4 text-left"><Icon className="h-5 w-5 shrink-0 text-aura-primary-purple" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-aura-text-muted">{action.type}</p><p className="mt-1 text-sm text-aura-text-primary">{action.type === 'CALCULATE' ? data.value : action.type === 'TRANSLATE' ? data.translatedText : action.type === 'TIME' ? data.time : data.date}</p></div></div>;
  return null;
};

export default InformationResult;