'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { Client, Permit, ChecklistItem, PermitStatus, ClientBranch, ChecklistTemplate, TemplateItem, Proposal } from './types';
import { sampleClients, samplePermits, sampleChecklistItems, generatePermitNumber, sampleClientBranches, sampleChecklistTemplates } from './data';
import { generateId, getTodayFormatted, calculateProgress } from './utils';

// Define the context shape
interface AppContextType {
  // Data
  clients: Client[];
  permits: Permit[];
  checklistItems: ChecklistItem[];
  clientBranches: ClientBranch[];
  checklistTemplates: ChecklistTemplate[];
  proposals: Proposal[];
  
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => string;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getClientPermits: (clientId: string) => Permit[];
  
  // Client branch operations
  addClientBranch: (branch: Omit<ClientBranch, 'id' | 'createdAt'>) => string;
  updateClientBranch: (id: string, branchData: Partial<ClientBranch>) => void;
  deleteClientBranch: (id: string) => void;
  getClientBranches: (clientId: string) => ClientBranch[];
  getClientBranchById: (id: string) => ClientBranch | undefined;
  
  // Permit operations
  addPermit: (permit: Omit<Permit, 'id' | 'createdAt' | 'progress' | 'permitNumber'>) => string;
  updatePermit: (id: string, permitData: Partial<Permit>) => void;
  deletePermit: (id: string) => void;
  getPermitById: (id: string) => Permit | undefined;
  getPermitClient: (permitId: string) => Client | undefined;
  
  // Checklist operations
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => string;
  updateChecklistItem: (id: string, data: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  getPermitChecklistItems: (permitId: string) => ChecklistItem[];
  getChecklistProgress: (permitId: string) => number;
  
  // Checklist template operations
  addChecklistTemplate: (template: Omit<ChecklistTemplate, 'id' | 'createdAt'>) => string;
  updateChecklistTemplate: (id: string, data: Partial<ChecklistTemplate>) => void;
  deleteChecklistTemplate: (id: string) => void;
  getChecklistTemplateById: (id: string) => ChecklistTemplate | undefined;
  applyTemplateToPermit: (templateId: string, permitId: string) => void;
  
  // Proposal operations
  getProposalById: (id: string) => Proposal | undefined;
  getClientProposals: (clientId: string) => Proposal[];
  getPermitProposals: (permitId: string) => Proposal[];
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: string, data: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  convertProposalToPermit: (proposalId: string) => string | undefined;
  
  // Dashboard operations
  getOpenPermits: () => Permit[];
  getPermitProgress: (permitId: string) => number;
  
  // Permit numbering
  nextPermitNumber: number;
  incrementPermitNumber: () => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize permit numbering - ensure it's sequential across app restarts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Update the permit counter to be the highest existing number + 1
      const storedPermits = localStorage.getItem('permits');
      if (storedPermits) {
        const permits = JSON.parse(storedPermits) as Permit[];
        const currentYear = new Date().getFullYear().toString().slice(-2);
        
        // Find the highest permit number for the current year
        let highestCounter = 0;
        permits.forEach(permit => {
          // Parse permit numbers in format YY-XXX
          if (permit.permitNumber && permit.permitNumber.startsWith(currentYear)) {
            const counterPart = permit.permitNumber.split('-')[1];
            if (counterPart) {
              const counter = parseInt(counterPart, 10);
              if (!isNaN(counter) && counter > highestCounter) {
                highestCounter = counter;
              }
            }
          }
        });
        
        // Store the highest counter in localStorage
        localStorage.setItem('permitCounter', highestCounter.toString());
        localStorage.setItem('permitYear', currentYear);
      }
    }
  }, []);

  // Load data from localStorage or use sample data
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== 'undefined') {
      const storedClients = localStorage.getItem('clients');
      return storedClients ? JSON.parse(storedClients) : sampleClients;
    }
    return sampleClients;
  });
  
  const [permits, setPermits] = useState<Permit[]>(() => {
    if (typeof window !== 'undefined') {
      const storedPermits = localStorage.getItem('permits');
      return storedPermits ? JSON.parse(storedPermits) : samplePermits;
    }
    return samplePermits;
  });
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const storedChecklistItems = localStorage.getItem('checklistItems');
      return storedChecklistItems ? JSON.parse(storedChecklistItems) : sampleChecklistItems;
    }
    return sampleChecklistItems;
  });

  const [clientBranches, setClientBranches] = useState<ClientBranch[]>(() => {
    if (typeof window !== 'undefined') {
      const storedBranches = localStorage.getItem('clientBranches');
      return storedBranches ? JSON.parse(storedBranches) : sampleClientBranches;
    }
    return sampleClientBranches;
  });

  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>(() => {
    if (typeof window !== 'undefined') {
      const storedTemplates = localStorage.getItem('checklistTemplates');
      return storedTemplates ? JSON.parse(storedTemplates) : sampleChecklistTemplates;
    }
    return sampleChecklistTemplates;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    if (typeof window !== 'undefined') {
      const storedProposals = localStorage.getItem('proposals');
      return storedProposals ? JSON.parse(storedProposals) : [];
    }
    return [];
  });

  // Save data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clients', JSON.stringify(clients));
      localStorage.setItem('permits', JSON.stringify(permits));
      localStorage.setItem('checklistItems', JSON.stringify(checklistItems));
      localStorage.setItem('clientBranches', JSON.stringify(clientBranches));
      localStorage.setItem('checklistTemplates', JSON.stringify(checklistTemplates));
      localStorage.setItem('proposals', JSON.stringify(proposals));
    }
  }, [clients, permits, checklistItems, clientBranches, checklistTemplates, proposals]);

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newClient: Client = {
      ...clientData,
      id,
      createdAt: getTodayFormatted(),
    };
    setClients([...clients, newClient]);
    return id;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === id ? { ...client, ...clientData } : client
      )
    );
  };

  const deleteClient = (id: string) => {
    // First check if client has permits
    const clientPermits = permits.filter(permit => permit.clientId === id);
    if (clientPermits.length > 0) {
      throw new Error("Cannot delete client with associated permits");
    }
    
    // Also delete any client branches
    setClientBranches(prevBranches => 
      prevBranches.filter(branch => branch.clientId !== id)
    );
    
    setClients(prevClients => prevClients.filter(client => client.id !== id));
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  const getClientPermits = (clientId: string) => {
    return permits.filter(permit => permit.clientId === clientId);
  };

  // Client branch operations
  const addClientBranch = (branchData: Omit<ClientBranch, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newBranch: ClientBranch = {
      ...branchData,
      id,
      createdAt: getTodayFormatted(),
    };
    
    // If this is set as main location, update other branches for this client
    if (branchData.isMainLocation) {
      setClientBranches(prevBranches =>
        prevBranches.map(branch =>
          branch.clientId === branchData.clientId 
            ? { ...branch, isMainLocation: false } 
            : branch
        )
      );
    }
    
    setClientBranches(prevBranches => [...prevBranches, newBranch]);
    return id;
  };

  const updateClientBranch = (id: string, branchData: Partial<ClientBranch>) => {
    let clientId = '';
    
    // If updating isMainLocation to true, set other branches to false
    if (branchData.isMainLocation) {
      const branch = clientBranches.find(b => b.id === id);
      if (branch) {
        clientId = branch.clientId;
        setClientBranches(prevBranches =>
          prevBranches.map(b =>
            b.clientId === clientId && b.id !== id
              ? { ...b, isMainLocation: false }
              : b
          )
        );
      }
    }
    
    setClientBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.id === id ? { ...branch, ...branchData } : branch
      )
    );
  };

  const deleteClientBranch = (id: string) => {
    const branch = clientBranches.find(b => b.id === id);
    
    // Don't allow deleting the main location if it's the only branch
    if (branch && branch.isMainLocation) {
      const clientBranchCount = clientBranches.filter(
        b => b.clientId === branch.clientId
      ).length;
      
      if (clientBranchCount === 1) {
        throw new Error("Cannot delete the only branch location for this client");
      }
    }
    
    setClientBranches(prevBranches => 
      prevBranches.filter(branch => branch.id !== id)
    );
  };

  const getClientBranches = (clientId: string) => {
    return clientBranches.filter(branch => branch.clientId === clientId);
  };

  const getClientBranchById = (id: string) => {
    return clientBranches.find(branch => branch.id === id);
  };

  // Permit operations
  const addPermit = (permitData: Omit<Permit, 'id' | 'createdAt' | 'progress' | 'permitNumber'>) => {
    const id = generateId();
    const permitNumber = generatePermitNumber();
    const newPermit: Permit = {
      ...permitData,
      id,
      createdAt: getTodayFormatted(),
      progress: 0,
      permitNumber,
    };
    setPermits([...permits, newPermit]);
    return id;
  };

  const updatePermit = (id: string, permitData: Partial<Permit>) => {
    setPermits(prevPermits =>
      prevPermits.map(permit =>
        permit.id === id ? { ...permit, ...permitData } : permit
      )
    );
  };

  const deletePermit = (id: string) => {
    // Also delete associated checklist items
    setChecklistItems(prevItems => 
      prevItems.filter(item => item.permitId !== id)
    );
    
    setPermits(prevPermits => 
      prevPermits.filter(permit => permit.id !== id)
    );
  };

  const getPermitById = (id: string) => {
    return permits.find(permit => permit.id === id);
  };

  const getPermitClient = (permitId: string) => {
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return undefined;
    return clients.find(client => client.id === permit.clientId);
  };

  // Checklist operations
  const addChecklistItem = (itemData: Omit<ChecklistItem, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newItem: ChecklistItem = {
      ...itemData,
      id,
      createdAt: getTodayFormatted(),
    };
    
    setChecklistItems(prevItems => [...prevItems, newItem]);
    
    // Update permit progress
    const permitItems = [...checklistItems, newItem].filter(
      item => item.permitId === itemData.permitId
    );
    const progress = calculateProgress(permitItems);
    
    updatePermit(itemData.permitId, { progress });
    
    return id;
  };

  const updateChecklistItem = (id: string, data: Partial<ChecklistItem>) => {
    let permitId = '';
    
    setChecklistItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          permitId = item.permitId;
          return { ...item, ...data };
        }
        return item;
      })
    );
    
    // Update permit progress if item was updated
    if (permitId) {
      const permitItems = checklistItems.filter(
        item => item.permitId === permitId
      );
      const updatedItems = permitItems.map(item => 
        item.id === id ? { ...item, ...data } : item
      );
      const progress = calculateProgress(updatedItems);
      
      updatePermit(permitId, { progress });
    }
  };

  const deleteChecklistItem = (id: string) => {
    const item = checklistItems.find(item => item.id === id);
    if (!item) return;
    
    const permitId = item.permitId;
    
    setChecklistItems(prevItems => 
      prevItems.filter(item => item.id !== id)
    );
    
    // Update permit progress
    const permitItems = checklistItems.filter(
      i => i.permitId === permitId && i.id !== id
    );
    const progress = calculateProgress(permitItems);
    
    updatePermit(permitId, { progress });
  };

  const getPermitChecklistItems = (permitId: string) => {
    return checklistItems.filter(item => item.permitId === permitId);
  };

  const getChecklistProgress = (permitId: string) => {
    const permitItems = checklistItems.filter(item => item.permitId === permitId);
    return calculateProgress(permitItems);
  };

  // Checklist template operations
  const addChecklistTemplate = (templateData: Omit<ChecklistTemplate, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newTemplate: ChecklistTemplate = {
      ...templateData,
      id,
      createdAt: getTodayFormatted(),
    };
    setChecklistTemplates([...checklistTemplates, newTemplate]);
    return id;
  };

  const updateChecklistTemplate = (id: string, data: Partial<ChecklistTemplate>) => {
    setChecklistTemplates(prevTemplates =>
      prevTemplates.map(template =>
        template.id === id ? { ...template, ...data } : template
      )
    );
  };

  const deleteChecklistTemplate = (id: string) => {
    setChecklistTemplates(prevTemplates => 
      prevTemplates.filter(template => template.id !== id)
    );
  };

  const getChecklistTemplateById = (id: string) => {
    return checklistTemplates.find(template => template.id === id);
  };

  const applyTemplateToPermit = (templateId: string, permitId: string) => {
    const template = checklistTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Create checklist items for each template item
    const newItems: ChecklistItem[] = [];
    
    template.items.forEach(item => {
      const newItem: ChecklistItem = {
        id: generateId(),
        permitId,
        title: item.title,
        completed: false,
        price: item.price,
        createdAt: getTodayFormatted()
      };
      newItems.push(newItem);
    });
    
    // Add the new items to the checklist
    setChecklistItems(prevItems => [...prevItems, ...newItems]);
    
    // Update permit progress
    const progress = calculateProgress(newItems);
    updatePermit(permitId, { progress });
  };

  // Proposal operations
  const getProposalById = (id: string) => {
    return proposals.find(proposal => proposal.id === id);
  };
  
  const getClientProposals = (clientId: string) => {
    return proposals.filter(proposal => proposal.clientId === clientId);
  };
  
  const getPermitProposals = (permitId: string) => {
    return proposals.filter(proposal => proposal.permitId === permitId);
  };
  
  const addProposal = (proposal: Proposal) => {
    const newProposal = {
      ...proposal,
      id: proposal.id || generateId(),
      createdAt: proposal.createdAt || getTodayFormatted()
    };
    setProposals(prev => [...prev, newProposal]);
  };
  
  const updateProposal = (id: string, data: Partial<Proposal>) => {
    setProposals(prevProposals =>
      prevProposals.map(proposal =>
        proposal.id === id ? { ...proposal, ...data } : proposal
      )
    );

    // If the proposal status is changed to 'accepted', check if we should convert it to a permit
    const updatedProposal = proposals.find(p => p.id === id);
    if (updatedProposal && data.status === 'accepted' && updatedProposal.status !== 'accepted') {
      convertProposalToPermit(id);
    }
  };
  
  const deleteProposal = (id: string) => {
    setProposals(prevProposals => 
      prevProposals.filter(proposal => proposal.id !== id)
    );
  };

  // Convert an approved proposal to a permit
  const convertProposalToPermit = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'accepted') return;

    // Create a permit based on the proposal data
    const newPermitData = {
      title: proposal.title,
      clientId: proposal.clientId,
      permitType: 'Commercial', // Default type
      status: 'draft' as PermitStatus,
      location: '', // This will need to be filled in later
      description: proposal.scope,
      permitNumber: `P-${nextPermitNumber}`
    };

    // Add the permit
    const permitId = addPermit(newPermitData);

    // Create checklist items from proposal items
    proposal.items.forEach(item => {
      addChecklistItem({
        permitId,
        title: item.description,
        completed: false,
        price: item.unitPrice * item.quantity
      });
    });

    // Update proposal to link it to the permit
    updateProposal(proposalId, { 
      permitId,
      notes: (proposal.notes || '') + `\nConverted to Permit #${newPermitData.permitNumber} on ${getTodayFormatted()}`
    });

    // Return the new permit ID
    return permitId;
  };

  // Dashboard operations
  const getOpenPermits = () => {
    // Get permits that are not approved or expired
    return permits.filter(
      permit => permit.status !== 'approved' && permit.status !== 'expired'
    ).sort((a, b) => {
      // Sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };
  
  const getPermitProgress = (permitId: string) => {
    const permit = permits.find(p => p.id === permitId);
    return permit?.progress || 0;
  };

  // Permit numbering
  const [nextPermitNumber, setNextPermitNumber] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedNumber = localStorage.getItem('nextPermitNumber');
      return storedNumber ? parseInt(storedNumber, 10) : 1001;
    }
    return 1001;
  });

  const incrementPermitNumber = () => {
    setNextPermitNumber(prev => {
      const next = prev + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nextPermitNumber', next.toString());
      }
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        // Data
        clients,
        permits,
        checklistItems,
        clientBranches,
        checklistTemplates,
        proposals,
        
        // Client operations
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        getClientPermits,
        
        // Client branch operations
        addClientBranch,
        updateClientBranch,
        deleteClientBranch,
        getClientBranches,
        getClientBranchById,
        
        // Permit operations
        addPermit,
        updatePermit,
        deletePermit,
        getPermitById,
        getPermitClient,
        
        // Checklist operations
        addChecklistItem,
        updateChecklistItem,
        deleteChecklistItem,
        getPermitChecklistItems,
        getChecklistProgress,
        
        // Checklist template operations
        addChecklistTemplate,
        updateChecklistTemplate,
        deleteChecklistTemplate,
        getChecklistTemplateById,
        applyTemplateToPermit,
        
        // Proposal operations
        getProposalById,
        getClientProposals,
        getPermitProposals,
        addProposal,
        updateProposal,
        deleteProposal,
        convertProposalToPermit,
        
        // Dashboard operations
        getOpenPermits,
        getPermitProgress,
        
        // Permit numbering
        nextPermitNumber,
        incrementPermitNumber,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 