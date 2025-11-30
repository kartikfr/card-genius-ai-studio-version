
import React, { useState } from 'react';
import { CreditCard } from '../types';
import { Button } from './Button';
import { Plus, Save, Trash2, RotateCcw, Check, AlertTriangle, Code, LayoutList } from 'lucide-react';
import { mapExhaustiveJSONToCard } from '../utils/cardMapper';

interface AdminDashboardProps {
  cards: CreditCard[];
  onUpdateCards: (cards: CreditCard[]) => void;
  onLogout: () => void;
}

const SAMPLE_JSON_TEMPLATE = `{
  "cardIdentification": {
    "cardId": "new-card-001",
    "cardName": "New Bank Credit Card",
    "bankName": "New Bank",
    "cardImageUrl": "https://placehold.co/600x400/png",
    "applicationUrl": "#"
  },
  "fees": {
    "joiningFee": { "amount": 500 },
    "annualFee": {
      "amount": 500,
      "waiverConditions": [
        { "type": "spend_based", "threshold": 100000, "description": "Waived on 1L spend" }
      ]
    }
  },
  "flipkartRewards": {
    "isApplicable": true,
    "rewardType": "cashback",
    "cashback": { "baseRate": 5.0 }
  },
  "amazonRewards": {
    "isApplicable": true,
    "rewardType": "cashback",
    "cashback": { "baseRate": 1.0 }
  },
  "marketing": {
    "keyHighlights": ["5% Cashback on Flipkart", "1% Flat other spends"]
  }
}`;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ cards, onUpdateCards, onLogout }) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddNew = () => {
    setSelectedCardId(null);
    setJsonInput(SAMPLE_JSON_TEMPLATE);
    setViewMode('EDITOR');
    setJsonError(null);
    setSuccessMsg('');
  };

  const handleEdit = (card: CreditCard) => {
    setSelectedCardId(card.id);
    // Since we store simplified objects, we can't revert perfectly to the exhaustive JSON 
    // without storing the raw source. For this demo, we'll show the simplified structure
    // but allow the user to PASTE the exhaustive format to update it.
    setJsonInput(JSON.stringify(card, null, 2));
    setViewMode('EDITOR');
    setJsonError(null);
    setSuccessMsg('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      const updated = cards.filter(c => c.id !== id);
      onUpdateCards(updated);
      if (selectedCardId === id) {
        setViewMode('LIST');
        setSelectedCardId(null);
      }
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      let newCard: CreditCard;

      // Check if it's the exhaustive format or the internal format
      if (parsed.cardIdentification) {
        // It's the exhaustive format -> Map it
        newCard = mapExhaustiveJSONToCard(parsed);
      } else if (parsed.id && parsed.rewards) {
        // It's likely the internal format
        newCard = parsed as CreditCard;
      } else {
        throw new Error("Unknown JSON format. Ensure it matches the Exhaustive DB Schema or Internal Schema.");
      }

      let updatedCards = [...cards];
      if (selectedCardId) {
        // Update existing
        const idx = updatedCards.findIndex(c => c.id === selectedCardId);
        if (idx >= 0) {
          updatedCards[idx] = newCard;
        } else {
           updatedCards.push(newCard); // ID changed? treat as new or error? Push for now.
        }
      } else {
        // Add new
        updatedCards.push(newCard);
      }

      onUpdateCards(updatedCards);
      setSuccessMsg('Card saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setJsonError(null);
      
      // Don't close editor immediately so they can tweak
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] animate-fadeIn">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-700">All Cards ({cards.length})</h3>
          <Button size="sm" onClick={handleAddNew} variant="primary" className="px-2 h-8">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {cards.map(card => (
            <div 
              key={card.id}
              onClick={() => handleEdit(card)}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedCardId === card.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
            >
              <div className="font-medium text-slate-900 truncate">{card.name}</div>
              <div className="text-xs text-slate-500">{card.bank}</div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50">
           <Button variant="outline" fullWidth onClick={onLogout} size="sm">
             Exit Admin Mode
           </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-slate-50 flex flex-col">
        {viewMode === 'LIST' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <LayoutList size={48} className="mb-4 opacity-50" />
             <p>Select a card to edit or create a new one.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-sm z-10">
               <div className="flex items-center gap-2">
                 <Code className="text-indigo-600" size={20} />
                 <span className="font-semibold text-slate-800">
                   {selectedCardId ? 'Edit Card Configuration' : 'New Card Configuration'}
                 </span>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setJsonInput(SAMPLE_JSON_TEMPLATE)} title="Reset to Template">
                    <RotateCcw size={18} />
                  </Button>
                  {selectedCardId && (
                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(selectedCardId)}>
                      <Trash2 size={18} />
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={!!successMsg}>
                    {successMsg ? <Check size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
                    {successMsg ? 'Saved' : 'Save Changes'}
                  </Button>
               </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                 <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-500 font-mono flex justify-between">
                    <span>JSON Input (Exhaustive Schema Supported)</span>
                    <span>Format: JSON</span>
                 </div>
                 <textarea
                   className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/50"
                   value={jsonInput}
                   onChange={(e) => setJsonInput(e.target.value)}
                   spellCheck={false}
                 />
               </div>
               
               {jsonError && (
                 <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3 animate-pulse">
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <div className="text-sm font-mono whitespace-pre-wrap">{jsonError}</div>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
