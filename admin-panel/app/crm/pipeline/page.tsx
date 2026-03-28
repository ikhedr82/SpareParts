'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  BarChart3, Plus, MoreHorizontal, DollarSign, 
  Calendar, User, ArrowRight
} from 'lucide-react';

const STAGES = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export default function PipelinePage() {
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const res = await api.get('/crm/opportunities');
        setOpportunities(res.data);
      } catch (err) {
        console.error('Failed to fetch opportunities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'WON': return 'bg-green-500';
      case 'LOST': return 'bg-gray-400';
      case 'PROPOSAL': return 'bg-blue-500';
      case 'QUALIFIED': return 'bg-indigo-500';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('crm.pipeline')}</h1>
          <p className="text-sm text-gray-500 mt-1">Track your sales opportunities through the funnel</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-shadow">
          <Plus className="w-4 h-4 me-2" />
          Add Opportunity
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
        {STAGES.map((stage) => {
          const stageOpps = opportunities.filter(o => o.stage === stage);
          const totalValue = stageOpps.reduce((sum, o) => sum + Number(o.value), 0);

          return (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStageColor(stage)}`} />
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">{stage}</h3>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {stageOpps.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  ${totalValue.toLocaleString()}
                </span>
              </div>

              <div className="bg-gray-100/50 p-2 rounded-2xl min-h-[500px] space-y-3 border border-dashed border-gray-200">
                {stageOpps.map((opp) => (
                  <div key={opp.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{opp.name}</h4>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <User className="w-3 h-3 me-1" />
                      {opp.businessClient?.businessName || opp.lead?.name || 'Contact'}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <div className="flex items-center text-blue-700 font-bold text-sm bg-blue-50 px-2 py-1 rounded-lg">
                        <DollarSign className="w-3 h-3 me-0.5" />
                        {Number(opp.value).toLocaleString()}
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-400 font-medium">
                        <Calendar className="w-3 h-3 me-1" />
                        {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium hover:border-gray-300 hover:text-gray-500 transition-all flex items-center justify-center gap-2 mt-4">
                  <Plus className="w-4 h-4" />
                  Quick Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
