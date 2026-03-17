# 📊 DataLens Pro

> Ferramenta profissional de análise de dados CSV — construída com **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Recharts** e **Zustand**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Visão Geral

O **DataLens Pro** é uma aplicação web para análise exploratória de arquivos CSV diretamente no navegador, sem necessidade de servidor, banco de dados ou conexão com a internet após o carregamento inicial.

Todo o processamento ocorre **100% no lado do cliente (browser)**. Os dados nunca saem do dispositivo do usuário.

### Principais capacidades

| Recurso | Descrição |
|---|---|
| 🏠 **Dashboard** | KPIs automáticos, gráficos de distribuição rápida e resumo completo das colunas |
| 📊 **Gráficos** | 6 tipos de gráfico com agrupamento e agregação configuráveis |
| 📈 **Estatísticas** | Média, mediana, desvio padrão, mínimo, máximo e soma por coluna numérica |
| 🔍 **Busca Avançada** | Busca por campo, todas as colunas e filtro geográfico por estado/município |
| 👁 **Explorar Dados** | Paginação completa de todos os registros com ficha detalhada por clique |
| ⚡ **Arquivos Grandes** | Suporte a arquivos de 500MB+ com leitura em chunks de 4MB |

---

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** 9+ (incluso com Node.js)

### Passos

```bash
# 1. Entre na pasta do projeto
cd datalens-next

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** no navegador.

### Build para produção

```bash
npm run build
npm start
```

---

## 🗂 Estrutura do Projeto

```
datalens-next/
│
├── app/                        # App Router do Next.js 16
│   ├── layout.tsx              # Layout raiz (metadados, fontes, CSS global)
│   ├── page.tsx                # Página inicial — renderiza o AppShell
│   ├── globals.css             # Estilos globais e variáveis CSS
│   │
│   ├── dashboard/page.tsx      # Página Dashboard
│   ├── charts/page.tsx         # Página Gráficos
│   ├── stats/page.tsx          # Página Estatísticas
│   ├── search/page.tsx         # Página Busca Avançada
│   └── preview/page.tsx        # Página Explorar Dados
│
├── components/
│   ├── AppShell.tsx            # Shell principal — topbar, sidebar, navegação
│   ├── UploadScreen.tsx        # Tela de upload com drag & drop
│   ├── PickerScreen.tsx        # Seletor de colunas + leitura em chunks
│   ├── ProgressScreen.tsx      # Barra de progresso durante o processamento
│   └── RecordModal.tsx         # Modal com ficha completa de um registro
│
├── lib/
│   ├── store.ts                # Estado global com Zustand
│   └── utils.ts                # Funções utilitárias (parsing, agrupamento, formatação)
│
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🔄 Fluxo da Aplicação

O app possui **4 telas** que se sucedem em ordem:

```
Upload → Picker → Progress → App
                               ├── Dashboard
                               ├── Gráficos
                               ├── Estatísticas
                               ├── Busca Avançada
                               └── Explorar Dados
```

### 1. Upload (`UploadScreen.tsx`)

O usuário seleciona ou arrasta um arquivo `.csv`. Ao receber o arquivo:

1. Lê apenas os primeiros **64KB** para extrair o cabeçalho (nomes das colunas)
2. Armazena o arquivo no estado global via Zustand
3. Avança para a tela de seleção de colunas

> Implementado com `<label htmlFor="file-input">` para máxima compatibilidade — evita problemas de bloqueio do `FileReader` em servidores locais como o Live Server do VS Code.

### 2. Seleção de Colunas (`PickerScreen.tsx`)

Exibe todas as colunas em um grid de chips clicáveis. O usuário escolhe quais colunas quer carregar.

- Botão **"Selecionar todas"** para análise completa
- Selecionar todas é recomendado para ter acesso à ficha completa de cada registro na busca

Ao confirmar, inicia a **leitura em chunks** (`lib/utils.ts` → `readFileInChunks`):

```
Arquivo CSV (ex: 500MB)
    │
    ├── Chunk 1 (4MB) → parse linha a linha → acumula em data{} e rows[]
    ├── Chunk 2 (4MB) → parse linha a linha → acumula em data{} e rows[]
    ├── ...
    └── Chunk N (4MB) → parse linha a linha → onDone()
```

- Cada chunk é processado com `setTimeout(next, 0)` para não bloquear o thread principal
- O progresso (%, linhas lidas, MB processados) é atualizado a cada chunk

### 3. Progresso (`ProgressScreen.tsx`)

Exibe em tempo real: percentual, título da etapa, linhas carregadas e volume processado.

### 4. Aplicação Principal (`AppShell.tsx`)

Shell com topbar fixa e sidebar lateral. Cada item do menu renderiza condicionalmente a página correspondente.

---

## 📦 Estado Global (`lib/store.ts`)

Gerenciado com **Zustand** — sem boilerplate de Redux/Context.

```typescript
interface DataStore {
  file: File | null                        // arquivo CSV original
  headers: string[]                        // todas as colunas do cabeçalho
  selCols: ColInfo[]                       // colunas selecionadas pelo usuário
  data: Record<string, string[]>           // valores por coluna (para gráficos e stats)
  rows: Record<string, string>[]           // todos os registros (para busca e preview)
  totalRows: number                        // total de linhas processadas
  isLoading: boolean
  loadProgress: number                     // 0–100
  loadTitle: string
  loadInfo: string
}
```

A separação entre `data` (arrays por coluna) e `rows` (objetos por linha) é intencional:

- `data` é otimizado para **cálculos estatísticos e gráficos** (iterar uma coluna inteira é rápido)
- `rows` é otimizado para **busca e preview** (filtrar registros completos)

---

## 📊 Páginas em Detalhe

### Dashboard

Gerado automaticamente ao carregar os dados:

- **6 KPIs**: total de registros, colunas analisadas, completude (%), numéricas, texto, tamanho
- **Gráfico de pizza** da primeira coluna categórica (top 8 valores por contagem)
- **Histograma** da primeira coluna numérica (10 buckets de largura igual)
- **Tabela resumo** de todas as colunas: tipo, preenchidos, nulos, únicos e exemplos

### Gráficos

Configuração manual com 5 parâmetros:

| Parâmetro | Opções |
|---|---|
| Tipo | Barras verticais, Barras horizontais, Linha, Pizza, Rosca, Dispersão |
| Eixo X | Qualquer coluna selecionada |
| Eixo Y | Colunas numéricas (ou todas, se não houver numéricas) |
| Agregação | Automático, Contagem, Soma, Média |
| Máx. categorias | Top 10 / 20 / 30 / 50 / Todos |

O agrupamento é feito por `groupBy()` em `lib/utils.ts`. Datas no formato `YYYY-MM-DD` são automaticamente agrupadas por **ano** (detectado pelo regex `/^(\d{4})/`).

### Estatísticas

Para cada coluna numérica calcula e exibe:

| Métrica | Método |
|---|---|
| Média | Soma / contagem |
| Mediana | Ordenação de amostra (até 10k valores) |
| Desvio Padrão | Desvio padrão populacional |
| Mínimo / Máximo | Redução com comparação |
| Soma | Redução com adição |
| Mini barra | Proporcional ao maior máximo entre todas as colunas |

### Busca Avançada

**Exemplos rápidos**: detecta automaticamente colunas relevantes para dados de saúde/SUS (SEXO, MORTE, RACA_COR, DIAG_PRINC, MARCA_UTI) e exibe cards que executam a busca instantaneamente ao clicar.

**Filtro geográfico**: detecta colunas de UF e município por regex:
- UF → `/^UF_|^UF$|_UF$|^UF_PART$|^ESTADO$/i`
- Município → `/^MUNIC|^CIDADE|^CITY/i`

Popula o dropdown de estados com os valores únicos da coluna detectada. Filtra estado + cidade simultaneamente.

**Busca por campo**:
- Suporta busca parcial (substring)
- Opção "Todas as colunas" verifica todos os campos de cada linha
- Destaca o termo encontrado nas células
- Limite de 500 resultados por busca

### Explorar Dados

- 100 registros por página
- Navegação com botões de página numerados (janela deslizante de 7 páginas)
- Clique em qualquer linha abre o `RecordModal`

### Modal de Registro (`RecordModal.tsx`)

- Fecha com `ESC`, botão `✕` ou clique no overlay
- Título detectado automaticamente: prioriza `N_AIH`, `IDENT`, `AIH` ou `ID` no nome
- Grid de cards: campos preenchidos em roxo, vazios em cinza itálico
- `overflow-y: auto` para fichas com muitas colunas

---

## ⚙️ Utilitários (`lib/utils.ts`)

```typescript
// Parser CSV que respeita campos com vírgula dentro de aspas
parseCSVLine(line: string): string[]

// Lê arquivo em pedaços de 4MB sem travar o navegador
readFileInChunks(file, onChunk, onDone, onError): void

// Verifica se uma coluna é numérica (testa os primeiros 60 valores)
isNumericCol(data, name): boolean

// Agrupa valores por categoria e retorna labels + values ordenados
groupBy(xVals, yVals, maxG, mode): GroupResult

// Amostra uniforme de um array grande
sampleArray(arr, n): T[]

// Formatação pt-BR com 2 casas decimais
fmt(n): string

// Número abreviado: 1500 → "1.5K", 1200000 → "1.2M"
fmtNumber(n): string

// Bytes legíveis: 536870912 → "512.0 MB"
formatBytes(b): string
```

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| [Next.js](https://nextjs.org) | 14.2 | Framework React com App Router |
| [TypeScript](https://typescriptlang.org) | 5 | Tipagem estática em todo o projeto |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Estilização utilitária |
| [Recharts](https://recharts.org) | 2.12 | BarChart, LineChart, PieChart, ScatterChart |
| [Zustand](https://zustand-demo.pmnd.rs) | 4.5 | Estado global leve e sem boilerplate |
| [PapaParse](https://papaparse.com) | 5.4 | Disponível como dependência (parser alternativo) |

---

## 💡 Decisões de Arquitetura

**Por que leitura em chunks?**
Arquivos de 500MB não podem ser lidos de uma vez — causaria travamento. Chunks de 4MB com `setTimeout(next, 0)` entre cada pedaço cede controle ao browser e permite atualizar a barra de progresso.

**Por que Zustand em vez de Context API?**
O estado (arquivo, colunas, dados, linhas) é compartilhado entre 5 páginas. Context API causaria re-renderizações em cascata. Zustand é seletivo — cada componente se inscreve apenas nos campos que usa.

**Por que `<label htmlFor>` no upload?**
`button onClick → input.click()` é bloqueado por alguns navegadores em ambientes de servidor local (Live Server do VS Code). `<label>` nativo é mais confiável e funciona em qualquer ambiente.

**Por que amostragem na mediana?**
Ordenar 1 milhão de valores travaria o navegador. `sampleArray` extrai até 10.000 valores distribuídos uniformemente — fornece estimativa estatisticamente válida com margem de erro pequena.

**Por que separar `data` e `rows`?**
`data` (arrays por coluna) é otimizado para iterar uma coluna inteira rapidamente em gráficos e cálculos. `rows` (objetos por linha) é otimizado para filtrar registros completos na busca. Manter os dois formatos dobra o uso de memória mas elimina conversões custosas em tempo de execução.

---

## ⚠️ Limitações

- **Memória**: arquivos muito grandes (1GB+) podem estourar a RAM do navegador dependendo do número de colunas selecionadas e da quantidade de dados por coluna
- **Mediana**: estimada por amostragem em arquivos com mais de 10.000 linhas — não é o valor matematicamente exato
- **Separador**: o parser espera vírgula (`,`). Arquivos exportados do Excel em português podem usar ponto-e-vírgula (`;`) — nesse caso, abra no Excel → Salvar Como → CSV (separado por vírgula)
- **Encoding**: espera UTF-8. Arquivos com encoding ANSI/Latin-1 podem exibir caracteres especiais incorretamente

---

## 📄 Licença

MIT — livre para uso, modificação e distribuição.
