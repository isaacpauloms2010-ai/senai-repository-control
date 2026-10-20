import React, { useState } from 'react';
import { Client, Supplier, Address } from '../types/erp';
import { Plus, Search, Pencil, Trash2, Users, Building2, MapPin, Phone, Mail, X, AlertCircle } from 'lucide-react';

interface PartnersViewProps {
  clients: Client[];
  suppliers: Supplier[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onNavigateToOrdersWithClient?: (clientId: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  clients,
  suppliers,
  onSaveClient,
  onDeleteClient,
  onSaveSupplier,
  onDeleteSupplier,
  onNavigateToOrdersWithClient
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Common Form state
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');
  const [formError, setFormError] = useState('');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm) ||
    c.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.document.includes(searchTerm) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenClientModal = (client?: Client) => {
    setEditingSupplier(null);
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setDocument(client.document);
      setContactName(client.contactName);
      setPhone(client.phone);
      setEmail(client.email);
      setNotes(client.notes || '');
      setStreet(client.address.street);
      setNumber(client.address.number);
      setComplement(client.address.complement || '');
      setNeighborhood(client.address.neighborhood);
      setCity(client.address.city);
      setState(client.address.state);
      setZipCode(client.address.zipCode);
    } else {
      setEditingClient(null);
      setName('');
      setDocument('');
      setContactName('');
      setPhone('');
      setEmail('');
      setNotes('');
      setStreet('');
      setNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('');
      setState('SP');
      setZipCode('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenSupplierModal = (supplier?: Supplier) => {
    setEditingClient(null);
    if (supplier) {
      setEditingSupplier(supplier);
      setName(supplier.name);
      setDocument(supplier.document);
      setContactName(supplier.contactName);
      setPhone(supplier.phone);
      setEmail(supplier.email);
      setCategory(supplier.category);
      setNotes(supplier.notes || '');
      setStreet(supplier.address.street);
      setNumber(supplier.address.number);
      setComplement(supplier.address.complement || '');
      setNeighborhood(supplier.address.neighborhood);
      setCity(supplier.address.city);
      setState(supplier.address.state);
      setZipCode(supplier.address.zipCode);
    } else {
      setEditingSupplier(null);
      setName('');
      setDocument('');
      setContactName('');
      setPhone('');
      setEmail('');
      setCategory('Insumos Industriais');
      setNotes('');
      setStreet('');
      setNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('');
      setState('SP');
      setZipCode('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O Nome/Razão Social é obrigatório.');
      return;
    }
    if (!document.trim()) {
      setFormError('O Documento (CNPJ ou CPF) é obrigatório.');
      return;
    }

    const address: Address = {
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim()
    };

    if (activeTab === 'clients') {
      const clientData: Client = {
        id: editingClient ? editingClient.id : `cli-${Date.now()}`,
        name: name.trim(),
        document: document.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address,
        notes: notes.trim() || undefined
      };
      onSaveClient(clientData);
    } else {
      const supplierData: Supplier = {
        id: editingSupplier ? editingSupplier.id : `sup-${Date.now()}`,
        name: name.trim(),
        document: document.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        category: category.trim() || 'Geral',
        address,
        notes: notes.trim() || undefined
      };
      onSaveSupplier(supplierData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Clientes e Fornecedores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão cadastral de parceiros comerciais, contatos fabris e endereços para faturamento e remessa.
          </p>
        </div>

        <button
          onClick={() => activeTab === 'clients' ? handleOpenClientModal() : handleOpenSupplierModal()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'clients' ? 'Novo Cliente' : 'Novo Fornecedor'}
        </button>
      </div>

      {/* Tabs and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Tab Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'clients'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Clientes ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Fornecedores ({suppliers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Buscar ${activeTab === 'clients' ? 'cliente' : 'fornecedor'} por nome, doc ou cidade...`}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-sans"
          />
        </div>
      </div>

      {/* Content for Clients */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Nenhum cliente cadastrado</p>
              <p className="text-xs text-slate-500 mt-1">Cadastre clientes para registrar novos pedidos de venda e entregas.</p>
            </div>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{client.name}</h3>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{client.document}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenClientModal(client)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                        title="Editar Cliente"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir cliente "${client.name}"?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{client.contactName || 'Contato não especificado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono tabular-nums">{client.phone || 'Sem telefone'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email || 'Sem e-mail'}</span>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 leading-tight">
                        {client.address.street}, {client.address.number}
                        {client.address.complement ? ` (${client.address.complement})` : ''} - {client.address.neighborhood}, {client.address.city}/{client.address.state} - CEP {client.address.zipCode}
                      </span>
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                    "{client.notes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Content for Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-xl">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Nenhum fornecedor cadastrado</p>
              <p className="text-xs text-slate-500 mt-1">Cadastre fornecedores para vincular às matérias-primas e controlar suprimentos.</p>
            </div>
          ) : (
            filteredSuppliers.map(supplier => (
              <div
                key={supplier.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{supplier.name}</h3>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{supplier.document}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenSupplierModal(supplier)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                        title="Editar Fornecedor"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir fornecedor "${supplier.name}"?`)) {
                            onDeleteSupplier(supplier.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                        title="Excluir Fornecedor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs font-medium text-amber-700">
                    Segmento: {supplier.category}
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{supplier.contactName || 'Representante comercial'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono tabular-nums">{supplier.phone || 'Sem telefone'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{supplier.email || 'Sem e-mail'}</span>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 leading-tight">
                        {supplier.address.street}, {supplier.address.number} - {supplier.address.neighborhood}, {supplier.address.city}/{supplier.address.state}
                      </span>
                    </div>
                  </div>
                </div>

                {supplier.notes && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                    "{supplier.notes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Client / Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === 'clients'
                    ? (editingClient ? 'Editar Cliente' : 'Novo Cliente')
                    : (editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informe dados cadastrais, contato responsável e endereço completo.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Alfa Manufatura Ltda"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Documento (CNPJ / CPF) *
                  </label>
                  <input
                    type="text"
                    required
                    value={document}
                    onChange={e => setDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / Celular
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {activeTab === 'suppliers' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria de Fornecimento
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Perfis Metálicos, Tintas, Fixadores, Embalagens..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}

              {/* Endereço */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Endereço
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="Rua, Avenida..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número</label>
                    <input
                      type="text"
                      value={number}
                      onChange={e => setNumber(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      placeholder="Bairro"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Cidade"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">UF / CEP</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        maxLength={2}
                        value={state}
                        onChange={e => setState(e.target.value.toUpperCase())}
                        placeholder="SP"
                        className="w-12 px-2 py-1.5 text-xs border border-slate-300 rounded-md uppercase font-mono text-center focus:ring-2 focus:ring-slate-900"
                      />
                      <input
                        type="text"
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        placeholder="00000-000"
                        className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Gerais
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Informações contratuais, regras de entrega ou restrições..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
