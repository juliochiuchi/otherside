import type { IconType } from '@/components/icons/brand-icons'
import {
  BlueskyIcon,
  DiscordIcon,
  DocsIcon,
  GithubIcon,
  XIcon,
} from '@/components/icons/brand-icons'
import {
  Activity,
  BarChart3,
  Calendar,
  Clapperboard,
  FolderKanban,
  FolderOpen,
  Gamepad2,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  NotebookPen,
  Phone,
  Play,
  Radio,
  ShoppingCart,
  Wand2,
} from 'lucide-react'

/**
 * Catálogo único de recursos do hub.
 *
 * Para adicionar um recurso novo basta incluir uma entrada em `items`.
 * - `kind: 'internal'` → página construída dentro deste app (`to` = rota).
 *   Enquanto a página não existir use `status: 'soon'`.
 * - `kind: 'external'` → projeto/ferramenta hospedado fora deste app (`href`).
 *
 * TODO: troque as URLs marcadas abaixo pelos links reais dos projetos externos.
 */

export type ResourceStatus = 'available' | 'soon'

type ResourceBase = {
  id: string
  title: string
  description: string
  icon: IconType
  /** Termos extras considerados na busca */
  keywords?: string[]
}

export type InternalResource = ResourceBase & {
  kind: 'internal'
  /** Rota do app que abre o recurso (ex.: '/painel') */
  to: string
  status?: ResourceStatus
}

export type ExternalResource = ResourceBase & {
  kind: 'external'
  href: string
}

export type Resource = InternalResource | ExternalResource

export type ResourceCategory = {
  id: string
  title: string
  description: string
  /** Ícone exibido no cabeçalho da seção */
  icon: IconType
  /** Cor de destaque aplicada ao ícone da seção e dos cards */
  accent: string
  items: Resource[]
}

export const resourceCategories: ResourceCategory[] = [
  {
    id: 'workspace',
    title: 'Workspace',
    description: 'Ferramentas construídas dentro do Otherside',
    icon: LayoutGrid,
    accent: 'oklch(0.62 0.2 292)',
    items: [
      {
        id: 'ibusquei',
        title: 'iBusquei',
        description: 'Listas de compras por setor, com rodadas reutilizáveis offline.',
        icon: ShoppingCart,
        kind: 'internal',
        to: '/ibusquei',
        keywords: ['compras', 'lista', 'mercado', 'setores', 'rodada', 'offline'],
      },
      {
        id: 'painel',
        title: 'Painel',
        description: 'Visão geral, indicadores e atividade recente.',
        icon: LayoutDashboard,
        kind: 'internal',
        to: '/painel',
        status: 'soon',
        keywords: ['dashboard', 'início', 'resumo'],
      },
      {
        id: 'projetos',
        title: 'Projetos',
        description: 'Organize iniciativas, tarefas e prazos.',
        icon: FolderKanban,
        kind: 'internal',
        to: '/projetos',
        status: 'soon',
        keywords: ['tarefas', 'kanban', 'backlog'],
      },
      {
        id: 'arquivos',
        title: 'Arquivos',
        description: 'Biblioteca de mídia, uploads e documentos.',
        icon: FolderOpen,
        kind: 'internal',
        to: '/arquivos',
        status: 'soon',
        keywords: ['mídia', 'uploads', 'documentos'],
      },
      {
        id: 'notas',
        title: 'Notas',
        description: 'Rascunhos, ideias e anotações rápidas.',
        icon: NotebookPen,
        kind: 'internal',
        to: '/notas',
        status: 'soon',
        keywords: ['anotações', 'ideias', 'rascunhos'],
      },
    ],
  },
  {
    id: 'midia',
    title: 'Mídia',
    description: 'Transmissões ao vivo e conteúdo sob demanda',
    icon: Clapperboard,
    accent: 'oklch(0.68 0.17 45)',
    items: [
      {
        id: 'ao-vivo',
        title: 'Ao vivo',
        description: 'Transmissões em tempo real e salas abertas.',
        icon: Radio,
        kind: 'internal',
        to: '/ao-vivo',
        status: 'soon',
        keywords: ['live', 'stream', 'tempo real'],
      },
      {
        id: 'videos',
        title: 'Vídeos',
        description: 'Catálogo de gravações sob demanda (VOD).',
        icon: Play,
        kind: 'internal',
        to: '/videos',
        status: 'soon',
        keywords: ['vod', 'gravações', 'player'],
      },
    ],
  },
  {
    id: 'analise',
    title: 'Análise',
    description: 'Métricas e acompanhamento de uso',
    icon: BarChart3,
    accent: 'oklch(0.68 0.15 155)',
    items: [
      {
        id: 'metricas',
        title: 'Métricas',
        description: 'Audiência, alcance e desempenho dos canais.',
        icon: BarChart3,
        kind: 'internal',
        to: '/metricas',
        status: 'soon',
        keywords: ['analytics', 'relatórios', 'audiência'],
      },
      {
        id: 'agenda',
        title: 'Agenda',
        description: 'Programação de publicações e eventos.',
        icon: Calendar,
        kind: 'internal',
        to: '/agenda',
        status: 'soon',
        keywords: ['calendário', 'eventos', 'programação'],
      },
    ],
  },
  {
    id: 'externos',
    title: 'Projetos externos',
    description: 'Ferramentas e perfis hospedados fora do Otherside',
    icon: Globe,
    accent: 'oklch(0.66 0.15 245)',
    items: [
      {
        id: 'tracker',
        title: 'Tracker',
        description: 'Painel de acompanhamento do projeto.',
        icon: Activity,
        kind: 'external',
        href: 'https://tracker-ecru-six.vercel.app/',
        keywords: ['tracker', 'acompanhamento', 'monitoramento'],
      },
      {
        id: 'orelhao',
        title: 'Orelhão',
        description: 'Projeto hospedado externamente.',
        icon: Phone,
        kind: 'external',
        href: 'https://orelhao-seven.vercel.app/',
        keywords: ['orelhão', 'projeto'],
      },
      {
        id: 'tiktak',
        title: 'TikTak',
        description: 'Projeto hospedado externamente.',
        icon: Gamepad2,
        kind: 'external',
        href: 'https://tiktak-mocha.vercel.app/',
        keywords: ['tiktak', 'jogo', 'projeto'],
      },
      {
        id: 'spellquest',
        title: 'SpellQuest',
        description: 'Projeto hospedado externamente.',
        icon: Wand2,
        kind: 'external',
        href: 'https://spellquest-bay.vercel.app/',
        keywords: ['spellquest', 'jogo', 'projeto'],
      },
      {
        id: 'github',
        title: 'GitHub',
        description: 'Repositórios, issues e pull requests.',
        icon: GithubIcon,
        kind: 'external',
        href: 'https://github.com/', // TODO: apontar para o repositório real
      },
      {
        id: 'documentacao',
        title: 'Documentação',
        description: 'Guias e referência técnica dos projetos.',
        icon: DocsIcon,
        kind: 'external',
        href: 'https://example.com/docs', // TODO: apontar para os docs reais
      },
      {
        id: 'bluesky',
        title: 'Bluesky',
        description: 'Atualizações e notas públicas.',
        icon: BlueskyIcon,
        kind: 'external',
        href: 'https://bsky.app/', // TODO: apontar para o perfil real
      },
      {
        id: 'x',
        title: 'X',
        description: 'Perfil e novidades na rede.',
        icon: XIcon,
        kind: 'external',
        href: 'https://x.com/', // TODO: apontar para o perfil real
      },
      {
        id: 'discord',
        title: 'Discord',
        description: 'Comunidade, avisos e suporte.',
        icon: DiscordIcon,
        kind: 'external',
        href: 'https://discord.com/', // TODO: apontar para o convite real
      },
    ],
  },
]

export const allResources: Resource[] = resourceCategories.flatMap(
  (category) => category.items,
)

/** Recursos internos que ainda não têm página construída. */
export function isComingSoon(resource: Resource): boolean {
  return resource.kind === 'internal' && resource.status === 'soon'
}

/** Recursos que podem ser abertos agora (usado pelo Command Palette). */
export const availableResources: Resource[] = allResources.filter(
  (resource) => !isComingSoon(resource),
)

function matches(resource: Resource, term: string) {
  const haystack = [
    resource.title,
    resource.description,
    ...(resource.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(term)
}

/**
 * Filtra o catálogo por título, descrição e palavras-chave.
 * Categorias sem resultados são omitidas do retorno.
 */
export function searchResources(
  query: string,
  categories: ResourceCategory[] = resourceCategories,
): ResourceCategory[] {
  const term = query.trim().toLowerCase()
  if (!term) return categories

  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => matches(item, term)),
    }))
    .filter((category) => category.items.length > 0)
}
