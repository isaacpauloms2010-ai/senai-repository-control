import { AppData } from '../types/erp';

export const initialMockData: AppData = {
  rawMaterials: [
    // --- 1. MATÉRIAS-PRIMAS: CANETA ESFEROGRÁFICA SIMPLES ---
    {
      id: 'mat-can-1',
      code: 'MP-CAN-01',
      name: 'Tubo / Corpo Hexagonal Plástico (Poliestireno Cristal)',
      unit: 'un',
      currentStock: 8500,
      minStock: 2000,
      costPerUnit: 0.12,
      supplierId: 'sup-1',
      notes: 'Corpo injetado sextavado transparente de 14.5cm com furo respirador.'
    },
    {
      id: 'mat-can-2',
      code: 'MP-CAN-02',
      name: 'Tubo Interno de Carga / Refil em Polietileno',
      unit: 'un',
      currentStock: 9200,
      minStock: 2500,
      costPerUnit: 0.08,
      supplierId: 'sup-1',
      notes: 'Tubo fino flexível para acondicionamento da coluna de tinta.'
    },
    {
      id: 'mat-can-3',
      code: 'MP-CAN-03',
      name: 'Ponta de Latão com Esfera de Carboneto de Tungstênio 1.0mm',
      unit: 'un',
      currentStock: 7400,
      minStock: 2000,
      costPerUnit: 0.15,
      supplierId: 'sup-1',
      notes: 'Ponta cônica de precisão para fluxo controlado de escrita.'
    },
    {
      id: 'mat-can-4',
      code: 'MP-CAN-04',
      name: 'Tinta Pastosa Esferográfica Azul Alta Viscosidade',
      unit: 'g',
      currentStock: 3500, // 3.5 kg de tinta (3500g)
      minStock: 800,
      costPerUnit: 0.05,
      supplierId: 'sup-1',
      notes: 'Tinta à base de óleo, secagem rápida e alta fluidez.'
    },
    {
      id: 'mat-can-5',
      code: 'MP-CAN-05',
      name: 'Tampa Ventilada com Clip em Polipropileno Azul',
      unit: 'un',
      currentStock: 6800,
      minStock: 1500,
      costPerUnit: 0.07,
      supplierId: 'sup-1',
      notes: 'Tampa de segurança com orifício antiasfixia e clip flexível.'
    },
    {
      id: 'mat-can-6',
      code: 'MP-CAN-06',
      name: 'Plug Traseiro de Vedação / Tampinha Superior',
      unit: 'un',
      currentStock: 8100,
      minStock: 2000,
      costPerUnit: 0.03,
      supplierId: 'sup-1',
      notes: 'Tampa plástica terminal prensada no fundo do corpo.'
    },

    // --- 2. MATÉRIAS-PRIMAS: BOLO DE CHOCOLATE ---
    {
      id: 'mat-bol-1',
      code: 'MP-BOL-01',
      name: 'Farinha de Trigo Especial Enriquecida',
      unit: 'kg',
      currentStock: 120,
      minStock: 30,
      costPerUnit: 4.8,
      supplierId: 'sup-2',
      notes: 'Farinha tipo 1 pura para massas leves e estruturadas.'
    },
    {
      id: 'mat-bol-2',
      code: 'MP-BOL-02',
      name: 'Cacau em Pó 50% Alcalino',
      unit: 'kg',
      currentStock: 38,
      minStock: 15,
      costPerUnit: 28.5,
      supplierId: 'sup-2',
      notes: 'Cacau solúvel puro sem adição de açúcar.'
    },
    {
      id: 'mat-bol-3',
      code: 'MP-BOL-03',
      name: 'Açúcar Cristal Refinado',
      unit: 'kg',
      currentStock: 95,
      minStock: 25,
      costPerUnit: 3.9,
      supplierId: 'sup-2',
      notes: 'Açúcar branco de alta dissolução.'
    },
    {
      id: 'mat-bol-4',
      code: 'MP-BOL-04',
      name: 'Ovos Frescos Pasteurizados Tipo A',
      unit: 'un',
      currentStock: 480,
      minStock: 120,
      costPerUnit: 0.65,
      supplierId: 'sup-2',
      notes: 'Cartelas de ovos selecionados inspecionados pelo SISP.'
    },
    {
      id: 'mat-bol-5',
      code: 'MP-BOL-05',
      name: 'Leite Integral Pasteurizado UHT',
      unit: 'l',
      currentStock: 85,
      minStock: 20,
      costPerUnit: 5.2,
      supplierId: 'sup-2',
      notes: 'Caixas tetrapak de 1 litro com alto teor de sólidos.'
    },
    {
      id: 'mat-bol-6',
      code: 'MP-BOL-06',
      name: 'Óleo Vegetal Refinado de Girassol',
      unit: 'l',
      currentStock: 45,
      minStock: 15,
      costPerUnit: 7.9,
      supplierId: 'sup-2',
      notes: 'Óleo neutro para conferir umidade e maciez à massa.'
    },
    {
      id: 'mat-bol-7',
      code: 'MP-BOL-07',
      name: 'Fermento Químico em Pó',
      unit: 'kg',
      currentStock: 12,
      minStock: 5,
      costPerUnit: 18.0,
      supplierId: 'sup-2',
      notes: 'Agente de crescimento para bolos e confeitos.'
    },
    {
      id: 'mat-bol-8',
      code: 'MP-BOL-08',
      name: 'Chocolate Granulado Crocante',
      unit: 'kg',
      currentStock: 26,
      minStock: 10,
      costPerUnit: 22.0,
      supplierId: 'sup-2',
      notes: 'Granulado puro para finalização e cobertura.'
    },
    {
      id: 'mat-bol-9',
      code: 'MP-BOL-09',
      name: 'Embalagem Descartável Cristal com Tampa Bolha',
      unit: 'un',
      currentStock: 150,
      minStock: 40,
      costPerUnit: 2.3,
      supplierId: 'sup-1',
      notes: 'Embalagem plástica termoformada para bolos de 20cm.'
    },

    // --- 3. MATÉRIAS-PRIMAS: CAMISA SOCIAL MANGA CURTA DE ALGODÃO ---
    {
      id: 'mat-cam-1',
      code: 'MP-CAM-01',
      name: 'Tecido Tricoline 100% Algodão Fio 50 Branco',
      unit: 'm',
      currentStock: 180,
      minStock: 50,
      costPerUnit: 24.5,
      supplierId: 'sup-3',
      notes: 'Rolo de tecido plano leve com toque macio e respirabilidade.'
    },
    {
      id: 'mat-cam-2',
      code: 'MP-CAM-02',
      name: 'Entretela Termocolante Tecida para Gola e Vista',
      unit: 'm²',
      currentStock: 35,
      minStock: 10,
      costPerUnit: 14.0,
      supplierId: 'sup-3',
      notes: 'Entretela com adesivo térmico para fusão em prensas.'
    },
    {
      id: 'mat-cam-3',
      code: 'MP-CAM-03',
      name: 'Botões de Poliéster 4 Furos Tamanho 18',
      unit: 'un',
      currentStock: 2400,
      minStock: 600,
      costPerUnit: 0.18,
      supplierId: 'sup-3',
      notes: 'Botões clássicos perolados com acabamento acetinado.'
    },
    {
      id: 'mat-cam-4',
      code: 'MP-CAM-04',
      name: 'Linha de Costura 100% Poliéster Fio 120',
      unit: 'm',
      currentStock: 9500,
      minStock: 2000,
      costPerUnit: 0.008,
      supplierId: 'sup-3',
      notes: 'Carretéis de alta tenacidade para costura reta e pesponto.'
    },
    {
      id: 'mat-cam-5',
      code: 'MP-CAM-05',
      name: 'Etiqueta Tecida de Marca e Composição',
      unit: 'un',
      currentStock: 820,
      minStock: 200,
      costPerUnit: 0.35,
      supplierId: 'sup-3',
      notes: 'Etiqueta de cetim dobrada com instruções de lavagem.'
    },
    {
      id: 'mat-cam-6',
      code: 'MP-CAM-06',
      name: 'Saco Plástico Protetor Transparente com Cabide',
      unit: 'un',
      currentStock: 210,
      minStock: 80,
      costPerUnit: 1.2,
      supplierId: 'sup-1',
      notes: 'Embalagem individual para vestuário dobrado ou pendurado.'
    },

    // --- 4. MATÉRIAS-PRIMAS: BANQUETA DE MADEIRA ---
    {
      id: 'mat-ban-1',
      code: 'MP-BAN-01',
      name: 'Madeira Maciça Aparelhada (Pés e Travessas 45x45mm)',
      unit: 'peça',
      currentStock: 140,
      minStock: 40,
      costPerUnit: 12.0,
      supplierId: 'sup-4',
      notes: 'Peças serradas e secas em estufa, livres de nós.'
    },
    {
      id: 'mat-ban-2',
      code: 'MP-BAN-02',
      name: 'Tampo / Assento Circular Maciço Diâmetro 32cm',
      unit: 'peça',
      currentStock: 35,
      minStock: 15,
      costPerUnit: 26.0,
      supplierId: 'sup-4',
      notes: 'Disco de madeira torneado com bordas boleadas.'
    },
    {
      id: 'mat-ban-3',
      code: 'MP-BAN-03',
      name: 'Cola para Madeira PVA Alta Resistência D3',
      unit: 'kg',
      currentStock: 18,
      minStock: 8,
      costPerUnit: 32.0,
      supplierId: 'sup-4',
      notes: 'Adesivo vinílico resistente à umidade e esforço mecânico.'
    },
    {
      id: 'mat-ban-4',
      code: 'MP-BAN-04',
      name: 'Parafuso Soberbo para Madeira 4.5 x 50mm',
      unit: 'un',
      currentStock: 1200,
      minStock: 300,
      costPerUnit: 0.22,
      supplierId: 'sup-4',
      notes: 'Fixador bicromatizado com cabeça chata Philips.'
    },
    {
      id: 'mat-ban-5',
      code: 'MP-BAN-05',
      name: 'Selador e Verniz Poliuretano Acetinado',
      unit: 'l',
      currentStock: 22,
      minStock: 10,
      costPerUnit: 48.0,
      supplierId: 'sup-4',
      notes: 'Revestimento protetor que realça os veios da madeira.'
    },
    {
      id: 'mat-ban-6',
      code: 'MP-BAN-06',
      name: 'Lixa para Madeira Grão 150/220',
      unit: 'un',
      currentStock: 45,
      minStock: 20,
      costPerUnit: 2.5,
      supplierId: 'sup-4',
      notes: 'Folhas de lixa de papel para acabamento sedoso.'
    },
    {
      id: 'mat-ban-7',
      code: 'MP-BAN-07',
      name: 'Feltro Protetor Nivelador Adesivo para Pés',
      unit: 'un',
      currentStock: 280,
      minStock: 80,
      costPerUnit: 0.5,
      supplierId: 'sup-4',
      notes: 'Pastilhas de feltro sintético anti-risco.'
    },

    // --- 5. MATÉRIAS-PRIMAS: CHINELO TIPO RASTEIRINHA EM PU SOLADO PVC ---
    {
      id: 'mat-chi-1',
      code: 'MP-CHI-01',
      name: 'Solado Injetado em PVC Antiderrapante Virgem',
      unit: 'peça',
      currentStock: 180,
      minStock: 50,
      costPerUnit: 9.5,
      supplierId: 'sup-5',
      notes: 'Solado plano anatômico com textura tratorada flexível.'
    },
    {
      id: 'mat-chi-2',
      code: 'MP-CHI-02',
      name: 'Palmilha Anatômica Conformada Forrada em PU',
      unit: 'peça',
      currentStock: 160,
      minStock: 45,
      costPerUnit: 7.2,
      supplierId: 'sup-5',
      notes: 'Palmilha macia acolchoada com pesponto perimetral.'
    },
    {
      id: 'mat-chi-3',
      code: 'MP-CHI-03',
      name: 'Tiras Superiores Decorativas em PU Sintético Soft',
      unit: 'conjunto',
      currentStock: 140,
      minStock: 40,
      costPerUnit: 6.8,
      supplierId: 'sup-5',
      notes: 'Cabedal em tiras duplas transpassadas com forro macio.'
    },
    {
      id: 'mat-chi-4',
      code: 'MP-CHI-04',
      name: 'Adesivo de Contato Químico Especial para Calçados',
      unit: 'kg',
      currentStock: 24,
      minStock: 10,
      costPerUnit: 38.0,
      supplierId: 'sup-5',
      notes: 'Adesivo poliuretano de alta aderência térmica e prensagem.'
    },
    {
      id: 'mat-chi-5',
      code: 'MP-CHI-05',
      name: 'Fivela Metálica Dourada Antiferrugem',
      unit: 'un',
      currentStock: 320,
      minStock: 100,
      costPerUnit: 1.1,
      supplierId: 'sup-5',
      notes: 'Acessório de ajuste e fechamento lateral do chinelo.'
    },
    {
      id: 'mat-chi-6',
      code: 'MP-CHI-06',
      name: 'Caixa Individual de Papelão Microondulado para Calçados',
      unit: 'un',
      currentStock: 190,
      minStock: 60,
      costPerUnit: 2.4,
      supplierId: 'sup-1',
      notes: 'Caixa kraft com papel seda protetor interno.'
    }
  ],

  products: [
    // 1. Caneta Esferográfica Simples
    {
      id: 'prod-caneta',
      code: 'CAN-101',
      name: 'Caneta Esferográfica Simples',
      description: 'Caneta esferográfica ponta média 1.0mm com corpo hexagonal transparente em poliestireno, tubo interno com carga de tinta azul, esfera de tungstênio, tampa ventilada e tampa traseira.',
      unit: 'un',
      processTimeMinutes: 2, // 2 minutos para injeção, montagem do refil e encaixes
      currentStock: 650,
      category: 'Material Escolar & Papelaria',
      materials: [
        { materialId: 'mat-can-1', quantityNeeded: 1 },    // 1 corpo hexagonal
        { materialId: 'mat-can-2', quantityNeeded: 1 },    // 1 tubo interno de refil
        { materialId: 'mat-can-3', quantityNeeded: 1 },    // 1 ponta com esfera
        { materialId: 'mat-can-4', quantityNeeded: 0.35 }, // 0.35g de tinta azul
        { materialId: 'mat-can-5', quantityNeeded: 1 },    // 1 tampa ventilada
        { materialId: 'mat-can-6', quantityNeeded: 1 }     // 1 tampinha traseira
      ]
    },

    // 2. Bolo de Chocolate
    {
      id: 'prod-bolo',
      code: 'BOL-102',
      name: 'Bolo de Chocolate',
      description: 'Bolo caseiro de chocolate fofinho tradicional de 1kg com massa aerada, calda de cacau e cobertura abundante de chocolate granulado crocante, embalado em forma descartável com tampa.',
      unit: 'un',
      processTimeMinutes: 45, // 45 minutos (pesagem, mistura, forneamento e finalização)
      currentStock: 14,
      category: 'Panificação & Confeitaria',
      materials: [
        { materialId: 'mat-bol-1', quantityNeeded: 0.35 }, // 350g farinha de trigo
        { materialId: 'mat-bol-2', quantityNeeded: 0.08 }, // 80g cacau em pó
        { materialId: 'mat-bol-3', quantityNeeded: 0.25 }, // 250g açúcar
        { materialId: 'mat-bol-4', quantityNeeded: 4 },    // 4 ovos
        { materialId: 'mat-bol-5', quantityNeeded: 0.25 }, // 250ml leite
        { materialId: 'mat-bol-6', quantityNeeded: 0.12 }, // 120ml óleo
        { materialId: 'mat-bol-7', quantityNeeded: 0.015 },// 15g fermento
        { materialId: 'mat-bol-8', quantityNeeded: 0.1 },  // 100g granulado
        { materialId: 'mat-bol-9', quantityNeeded: 1 }     // 1 embalagem descartável
      ]
    },

    // 3. Camisa social manga curta de algodão
    {
      id: 'prod-camisa',
      code: 'CAM-103',
      name: 'Camisa social manga curta de algodão',
      description: 'Camisa social clássica manga curta confeccionada em tricoline 100% algodão fio 50, colarinho e vista com entretela estruturada, 8 botões frontais perolados, pesponto fino e embalagem individual com cabide.',
      unit: 'un',
      processTimeMinutes: 35, // 35 minutos de corte, costura, caseado, botões e passadoria
      currentStock: 28,
      category: 'Vestuário & Confecção',
      materials: [
        { materialId: 'mat-cam-1', quantityNeeded: 1.4 },  // 1.4m de tricoline algodão
        { materialId: 'mat-cam-2', quantityNeeded: 0.25 }, // 0.25m² entretela colante
        { materialId: 'mat-cam-3', quantityNeeded: 8 },    // 8 botões
        { materialId: 'mat-cam-4', quantityNeeded: 45 },   // 45m de linha de costura
        { materialId: 'mat-cam-5', quantityNeeded: 1 },    // 1 etiqueta tecida
        { materialId: 'mat-cam-6', quantityNeeded: 1 }     // 1 saco plástico com cabide
      ]
    },

    // 4. Banqueta de madeira
    {
      id: 'prod-banqueta',
      code: 'BAN-104',
      name: 'Banqueta de madeira',
      description: 'Banqueta média artesanal em madeira maciça aparelhada e tratada, assento circular torneado de 32cm, pés travados com cola PVA D3 e parafusos soberbos, lixada e finalizada com verniz poliuretano acetinado.',
      unit: 'un',
      processTimeMinutes: 50, // 50 minutos (corte, torneamento, montagem, colagem e envernizamento)
      currentStock: 16,
      category: 'Móveis & Marcenaria',
      materials: [
        { materialId: 'mat-ban-1', quantityNeeded: 4 },    // 4 peças de madeira aparelhada (pés/travessas)
        { materialId: 'mat-ban-2', quantityNeeded: 1 },    // 1 tampo/assento circular maciço
        { materialId: 'mat-ban-3', quantityNeeded: 0.06 }, // 60g cola para madeira
        { materialId: 'mat-ban-4', quantityNeeded: 8 },    // 8 parafusos soberbos
        { materialId: 'mat-ban-5', quantityNeeded: 0.08 }, // 80ml verniz poliuretano
        { materialId: 'mat-ban-6', quantityNeeded: 0.5 },  // 0.5 folha de lixa
        { materialId: 'mat-ban-7', quantityNeeded: 4 }     // 4 feltros protetores
      ]
    },

    // 5. Chinelo tipo rasteirinha em PU solado PVC
    {
      id: 'prod-chinelo',
      code: 'CHI-105',
      name: 'Chinelo tipo rasteirinha em PU solado PVC',
      description: 'Rasteirinha casual feminina com solado flexível injetado em PVC antiderrapante, palmilha anatômica acolchoada forrada em PU sintético, tiras decorativas com pesponto e fivelas douradas, acondicionada em caixa de calçado.',
      unit: 'un',
      processTimeMinutes: 25, // 25 minutos (corte das tiras, colagem, prensagem térmica e montagem)
      currentStock: 35,
      category: 'Calçados & Acessórios',
      materials: [
        { materialId: 'mat-chi-1', quantityNeeded: 1 },    // 1 solado em PVC antiderrapante
        { materialId: 'mat-chi-2', quantityNeeded: 1 },    // 1 palmilha anatômica PU
        { materialId: 'mat-chi-3', quantityNeeded: 1 },    // 1 conjunto de tiras em PU
        { materialId: 'mat-chi-4', quantityNeeded: 0.04 }, // 40g adesivo de contato calçadista
        { materialId: 'mat-chi-5', quantityNeeded: 2 },    // 2 fivelas metálicas
        { materialId: 'mat-chi-6', quantityNeeded: 1 }     // 1 caixa de papelão com seda
      ]
    }
  ],

  clients: [
    {
      id: 'cli-1',
      name: 'Distribuidora Papelaria & Livraria Central Ltda',
      document: '28.491.802/0001-44',
      contactName: 'Carlos Eduardo Ramos',
      phone: '(11) 98765-4321',
      email: 'compras@papelariacentral.com.br',
      address: {
        street: 'Avenida das Nações Unidas',
        number: '14200',
        complement: 'Galpão 03',
        neighborhood: 'Vila Gertrudes',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04794-000'
      },
      notes: 'Cliente de grandes volumes para material escolar e escritório.'
    },
    {
      id: 'cli-2',
      name: 'Rede de Cafeterias & Docerias Doce Sabor',
      document: '41.229.710/0001-18',
      contactName: 'Mariana Duarte',
      phone: '(19) 3871-9900',
      email: 'pedidos@docesaborcafeteria.com.br',
      address: {
        street: 'Rua das Camélias',
        number: '550',
        neighborhood: 'Cambuí',
        city: 'Campinas',
        state: 'SP',
        zipCode: '13054-750'
      },
      notes: 'Entregas semanais programadas de bolos e produtos de panificação.'
    },
    {
      id: 'cli-3',
      name: 'Boutique & Calçados Moda Verão SA',
      document: '33.918.442/0001-90',
      contactName: 'Renato Silva',
      phone: '(21) 99123-8877',
      email: 'renato@modaveraorio.com.br',
      address: {
        street: 'Rua Visconde de Pirajá',
        number: '310',
        complement: 'Loja 12',
        neighborhood: 'Ipanema',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22410-002'
      },
      notes: 'Pedidos sazonais de vestuário e rasteirinhas casuais.'
    }
  ],

  suppliers: [
    {
      id: 'sup-1',
      name: 'Plásticos & Polímeros Tubulares Brasil Ltda',
      document: '51.982.341/0001-67',
      contactName: 'Antônio Ferreira',
      phone: '(11) 3321-4400',
      email: 'vendas@polimerosbrasil.com.br',
      category: 'Plásticos, Resinas & Embalagens',
      address: {
        street: 'Rodovia Anhanguera',
        number: 'KM 38',
        neighborhood: 'Distrito Industrial',
        city: 'Jundiaí',
        state: 'SP',
        zipCode: '13214-000'
      },
      notes: 'Fornecedor de corpos plásticos, pontas, tampas e embalagens descartáveis.'
    },
    {
      id: 'sup-2',
      name: 'Moinho & Distribuidora de Alimentos Panificadora',
      document: '18.449.120/0001-05',
      contactName: 'Silvana Rocha',
      phone: '(11) 4022-8181',
      email: 'atendimento@distribuidoraalimentos.com.br',
      category: 'Farinhas, Açúcares & Ingredientes',
      address: {
        street: 'Avenida Industrial dos Grãos',
        number: '890',
        neighborhood: 'Bairro Novo',
        city: 'Itu',
        state: 'SP',
        zipCode: '13309-600'
      }
    },
    {
      id: 'sup-3',
      name: 'Têxtil & Aviamentos Nacional S/A',
      document: '07.312.981/0001-22',
      contactName: 'Jorge Alencar',
      phone: '(11) 2088-7711',
      email: 'vendas@textilaviamentos.com.br',
      category: 'Tecidos, Botões & Aviamentos',
      address: {
        street: 'Rua do Brás',
        number: '1240',
        neighborhood: 'Brás',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03168-010'
      }
    },
    {
      id: 'sup-4',
      name: 'Madeireira & Suprimentos Marcenaria Pinhal',
      document: '62.771.092/0001-38',
      contactName: 'Beatriz Vasconcelos',
      phone: '(11) 4591-2000',
      email: 'vendas@madeireirapinhal.com.br',
      category: 'Madeiras, Colas & Vernizes',
      address: {
        street: 'Estrada da Madeira',
        number: '310',
        neighborhood: 'Zona Rural',
        city: 'Cotia',
        state: 'SP',
        zipCode: '06713-100'
      }
    },
    {
      id: 'sup-5',
      name: 'Injetados & Componentes para Calçados Couroflex',
      document: '74.192.551/0001-93',
      contactName: 'Carlos Mendonça',
      phone: '(16) 3711-8200',
      email: 'atendimento@couroflexcalcados.com.br',
      category: 'Solados PVC, PU Sintético & Fivelas',
      address: {
        street: 'Avenida Calçadista',
        number: '1500',
        neighborhood: 'Distrito Calçadista',
        city: 'Franca',
        state: 'SP',
        zipCode: '14405-200'
      }
    }
  ],

  customerOrders: [
    {
      id: 'ord-1',
      code: 'PED-2026-001',
      clientId: 'cli-1',
      orderDate: '2026-10-15',
      deliveryDate: '2026-10-28',
      items: [
        { productId: 'prod-caneta', quantity: 500 }
      ],
      status: 'Em Produção',
      notes: 'Remessa prioritária para início do período de voltas às aulas.',
      generatedOpIds: ['op-1']
    },
    {
      id: 'ord-2',
      code: 'PED-2026-002',
      clientId: 'cli-2',
      orderDate: '2026-10-18',
      deliveryDate: '2026-10-25',
      items: [
        { productId: 'prod-bolo', quantity: 30 }
      ],
      status: 'Pendente',
      notes: 'Bolo de chocolate para abastecimento de 5 unidades de cafeterias.',
      generatedOpIds: []
    },
    {
      id: 'ord-3',
      code: 'PED-2026-003',
      clientId: 'cli-3',
      orderDate: '2026-10-10',
      deliveryDate: '2026-10-24',
      items: [
        { productId: 'prod-chinelo', quantity: 40 },
        { productId: 'prod-camisa', quantity: 20 }
      ],
      status: 'Em Produção',
      notes: 'Coleção de primavera/verão com entrega fracionada.',
      generatedOpIds: ['op-2', 'op-3']
    }
  ],

  productionOrders: [
    {
      id: 'op-1',
      code: 'OP-2026-081',
      originOrderId: 'ord-1',
      productId: 'prod-caneta',
      quantity: 500,
      createdDate: '2026-10-16',
      targetDeliveryDate: '2026-10-26',
      status: 'Em Produção',
      estimatedDurationHours: 16.67, // (2 min * 500 un) / 60 = 16.67h
      stockDeducted: true,
      productStockAdded: false,
      notes: 'Montagem mecânica dos tubos com carga e tamponamento final.'
    },
    {
      id: 'op-2',
      code: 'OP-2026-082',
      originOrderId: 'ord-3',
      productId: 'prod-chinelo',
      quantity: 40,
      createdDate: '2026-10-17',
      targetDeliveryDate: '2026-10-23',
      status: 'Em Produção',
      estimatedDurationHours: 16.67, // (25 min * 40 un) / 60 = 16.67h
      stockDeducted: true,
      productStockAdded: false,
      notes: 'Prensagem das tiras e palmilhas sobre o solado de PVC.'
    },
    {
      id: 'op-3',
      code: 'OP-2026-083',
      originOrderId: 'ord-3',
      productId: 'prod-camisa',
      quantity: 20,
      createdDate: '2026-10-18',
      targetDeliveryDate: '2026-10-24',
      status: 'Planejada',
      estimatedDurationHours: 11.67, // (35 min * 20 un) / 60 = 11.67h
      stockDeducted: false,
      productStockAdded: false,
      notes: 'Corte do tecido finalizado, aguardando entrada na linha de costura.'
    },
    {
      id: 'op-4',
      code: 'OP-2026-084',
      productId: 'prod-banqueta',
      quantity: 12,
      createdDate: '2026-10-19',
      targetDeliveryDate: '2026-10-30',
      status: 'Planejada',
      estimatedDurationHours: 10.0, // (50 min * 12 un) / 60 = 10h
      stockDeducted: false,
      productStockAdded: false,
      notes: 'Lote de banqueta de madeira para reposição de mostruário.'
    },
    {
      id: 'op-5',
      code: 'OP-2026-079',
      productId: 'prod-bolo',
      quantity: 25,
      createdDate: '2026-10-12',
      targetDeliveryDate: '2026-10-13',
      status: 'Concluída',
      estimatedDurationHours: 18.75, // (45 min * 25 un) / 60 = 18.75h
      stockDeducted: true,
      productStockAdded: true,
      notes: 'Lote assado e embalado com sucesso na forma bolha.'
    }
  ],

  capacity: {
    periodType: 'mes',
    periodLabel: 'Mês Vigente (Outubro 2026)',
    workDaysPerPeriod: 22,
    shiftsPerDay: 1,
    hoursPerShift: 8,
    numberOfWorkers: 4,
    efficiencyRate: 85
  },

  lastUpdated: new Date().toISOString()
};
