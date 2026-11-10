import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Coffee,
  Compass,
  Heart,
  HeartHandshake,
  Home,
  Lightbulb,
  ListChecks,
  MapPin,
  Menu,
  MoreHorizontal,
  Palette,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react'

type Tab = 'home' | 'discover' | 'goals' | 'profile'
type DiscoverMode = 'all' | 'saved' | 'completed'
type FilterKey = 'time' | 'budget' | 'type'

type Experience = {
  id: number
  title: string
  description: string
  category: string
  categoryLabel: string
  duration: string
  durationMinutes: number
  budget: string
  budgetLevel: number
  location: string
  color: string
  icon: LucideIcon
  tag?: string
}

type Goal = {
  id: number
  title: string
  description: string
  progress: number
  total: number
  accent: string
  icon: LucideIcon
  nextStep: string
}

const experiences: Experience[] = [
  {
    id: 1,
    title: 'Cozinhar algo novo juntos',
    description: 'Escolham uma receita que nenhum dos dois já fez. O resultado importa menos que a bagunça na cozinha.',
    category: 'casa',
    categoryLabel: 'Em casa',
    duration: '45 min',
    durationMinutes: 45,
    budget: 'R$ 60',
    budgetLevel: 1,
    location: 'Na cozinha de vocês',
    color: 'peach',
    icon: Coffee,
    tag: 'Combina com vocês',
  },
  {
    id: 2,
    title: 'Caminhada sem destino',
    description: 'Deixem o celular no bolso, escolham uma rua nova e descubram um cantinho para tomar um café.',
    category: 'fora',
    categoryLabel: 'Lá fora',
    duration: '1h 30',
    durationMinutes: 90,
    budget: 'R$ 40',
    budgetLevel: 1,
    location: 'Perto de vocês',
    color: 'sage',
    icon: MapPin,
    tag: 'Leve e sem pressa',
  },
  {
    id: 3,
    title: 'Cartas para o futuro',
    description: 'Escrevam uma carta para abrir daqui a um ano. Falem sobre onde querem estar e o que não querem esquecer.',
    category: 'conexao',
    categoryLabel: 'Conexão',
    duration: '30 min',
    durationMinutes: 30,
    budget: 'Grátis',
    budgetLevel: 0,
    location: 'Um lugar tranquilo',
    color: 'lilac',
    icon: HeartHandshake,
    tag: 'Para guardar',
  },
  {
    id: 4,
    title: 'Noite de restaurante novo',
    description: 'Escolham um lugar que nenhum dos dois conhece e deem notas para o prato, o ambiente e a conversa.',
    category: 'fora',
    categoryLabel: 'Lá fora',
    duration: '2h',
    durationMinutes: 120,
    budget: 'R$ 180',
    budgetLevel: 3,
    location: 'Até 5 km',
    color: 'sunset',
    icon: Sparkles,
    tag: 'Um pequeno evento',
  },
  {
    id: 5,
    title: 'Playlist da história de vocês',
    description: 'Cada um escolhe cinco músicas que lembram um momento da relação. Depois, escutem sem pular nenhuma.',
    category: 'conexao',
    categoryLabel: 'Conexão',
    duration: '40 min',
    durationMinutes: 40,
    budget: 'Grátis',
    budgetLevel: 0,
    location: 'Em casa',
    color: 'blue',
    icon: Palette,
  },
  {
    id: 6,
    title: 'Planejar uma escapada',
    description: 'Separem uma noite para pesquisar um destino próximo e montar um plano possível para os próximos meses.',
    category: 'planos',
    categoryLabel: 'Planos',
    duration: '1h',
    durationMinutes: 60,
    budget: 'R$ 300',
    budgetLevel: 4,
    location: 'Na mesa de vocês',
    color: 'yellow',
    icon: CalendarDays,
  },
]

const initialGoals: Goal[] = [
  {
    id: 1,
    title: '12 momentos só nossos',
    description: 'Uma experiência por mês, sem precisar ser grandiosa.',
    progress: 7,
    total: 12,
    accent: 'coral',
    icon: Heart,
    nextStep: 'Escolher o momento de novembro',
  },
  {
    id: 2,
    title: 'Fundo para a próxima viagem',
    description: 'Guardar um pouco por mês para transformar vontade em roteiro.',
    progress: 4,
    total: 10,
    accent: 'sage',
    icon: WalletCards,
    nextStep: 'Definir o destino da vez',
  },
  {
    id: 3,
    title: 'Conversas que aproximam',
    description: 'Criar espaço para falar do que importa, com calma.',
    progress: 3,
    total: 8,
    accent: 'lilac',
    icon: Lightbulb,
    nextStep: 'Responder uma pergunta juntos',
  },
]

const navItems: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'discover', label: 'Descobrir', icon: Compass },
  { id: 'goals', label: 'Objetivos', icon: Target },
  { id: 'profile', label: 'Perfil', icon: CircleUserRound },
]

const pageCopy: Record<Tab, { eyebrow: string; title: string; subtitle: string }> = {
  home: { eyebrow: 'Terça, 10 de novembro', title: 'Continuem escolhendo um ao outro.', subtitle: 'Pequenas escolhas também constroem uma história grande.' },
  discover: { eyebrow: 'Curadoria para vocês', title: 'O que combina com o momento?', subtitle: 'Ideias simples, filtradas pelo tempo e pelo jeito de vocês.' },
  goals: { eyebrow: 'Construindo lado a lado', title: 'Planos que viram memória.', subtitle: 'Acompanhem os pequenos passos que fazem sentido para o casal.' },
  profile: { eyebrow: 'O jeito de vocês', title: 'Conhecer também é cuidar.', subtitle: 'As preferências abaixo ajudam a deixar cada sugestão mais com a cara de vocês.' },
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(tabFromPath())
  const [savedIds, setSavedIds] = useState<number[]>([2, 5])
  const [completedIds, setCompletedIds] = useState<number[]>([3])
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [discoverMode, setDiscoverMode] = useState<DiscoverMode>('all')
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ time: 'Qualquer duração', budget: 'Qualquer orçamento', type: 'Todos os tipos' })
  const [toast, setToast] = useState('')

  const navigate = (tab: Tab) => {
    setActiveTab(tab)
    window.history.pushState({}, '', tab === 'home' ? '/' : `/${tab === 'discover' ? 'descobrir' : tab === 'goals' ? 'objetivos' : 'perfil'}`)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const toggleSaved = (id: number) => {
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    showToast(savedIds.includes(id) ? 'Removido dos salvos.' : 'Salvo para um próximo momento.')
  }

  const toggleCompleted = (id: number) => {
    const wasCompleted = completedIds.includes(id)
    setCompletedIds((current) => wasCompleted ? current.filter((item) => item !== id) : [...current, id])
    showToast(wasCompleted ? 'Voltamos essa ideia para a sua lista.' : 'Momento marcado como vivido. Que delícia!')
  }

  const updateGoal = (id: number) => {
    setGoals((current) => current.map((goal) => goal.id === id ? { ...goal, progress: Math.min(goal.total, goal.progress + 1) } : goal))
    showToast('Progresso atualizado para vocês dois.')
  }

  const filteredExperiences = useMemo(() => experiences.filter((experience) => {
    const timeOk = filters.time === 'Qualquer duração' || (filters.time === 'Até 30 min' && experience.durationMinutes <= 30) || (filters.time === 'Até 1 hora' && experience.durationMinutes <= 60) || (filters.time === 'Mais de 1 hora' && experience.durationMinutes > 60)
    const budgetOk = filters.budget === 'Qualquer orçamento' || (filters.budget === 'Grátis' && experience.budgetLevel === 0) || (filters.budget === 'Até R$ 80' && experience.budgetLevel <= 1) || (filters.budget === 'Até R$ 200' && experience.budgetLevel <= 3)
    const typeOk = filters.type === 'Todos os tipos' || (filters.type === 'Em casa' && experience.category === 'casa') || (filters.type === 'Lá fora' && experience.category === 'fora') || (filters.type === 'Conexão' && experience.category === 'conexao') || (filters.type === 'Planos' && experience.category === 'planos')
    const modeOk = discoverMode === 'all' || (discoverMode === 'saved' && savedIds.includes(experience.id)) || (discoverMode === 'completed' && completedIds.includes(experience.id))
    return timeOk && budgetOk && typeOk && modeOk
  }), [completedIds, discoverMode, filters, savedIds])

  const completedGoalCount = goals.reduce((sum, goal) => sum + goal.progress, 0)
  const totalGoalCount = goals.reduce((sum, goal) => sum + goal.total, 0)
  const overallProgress = Math.round((completedGoalCount / totalGoalCount) * 100)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup" onClick={() => navigate('home')} role="button" tabIndex={0}>
          <div className="brand-mark"><HeartHandshake size={20} strokeWidth={2.4} /></div>
          <div><strong>Nós</strong><span>cultive o que vocês têm</span></div>
        </div>

        <div className="sidebar-section-label">Menu</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => navigate(id)}>
              <Icon size={19} strokeWidth={activeTab === id ? 2.4 : 1.9} />
              <span>{label}</span>
              {id === 'goals' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <div className="note-icon"><Sparkles size={17} /></div>
          <p><strong>Uma ideia para hoje</strong> não precisa ser perfeita, só precisa ser de vocês.</p>
          <button onClick={() => navigate('discover')}>Ver ideias <ArrowRight size={14} /></button>
        </div>

        <div className="sidebar-footer">
          <button className="mini-profile" onClick={() => navigate('profile')}>
            <div className="avatar avatar-small avatar-photo">Y<span>&</span>M</div>
            <div><strong>Yuri & Marina</strong><span>Juntos há 3 anos</span></div>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Espaço do casal</span><ChevronRight size={14} /><strong>{pageCopy[activeTab].title}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notificações"><Bell size={18} /><span /></button>
            <button className="avatar avatar-photo" onClick={() => navigate('profile')} aria-label="Abrir perfil">Y<span>&</span>M</button>
          </div>
        </header>

        <div className="page-wrap">
          {activeTab === 'home' && <HomePage navigate={navigate} savedIds={savedIds} completedIds={completedIds} toggleSaved={toggleSaved} toggleCompleted={toggleCompleted} overallProgress={overallProgress} goals={goals} />}
          {activeTab === 'discover' && <DiscoverPage experiences={filteredExperiences} filters={filters} setFilters={setFilters} discoverMode={discoverMode} setDiscoverMode={setDiscoverMode} savedIds={savedIds} completedIds={completedIds} toggleSaved={toggleSaved} toggleCompleted={toggleCompleted} resetFilters={() => setFilters({ time: 'Qualquer duração', budget: 'Qualquer orçamento', type: 'Todos os tipos' })} />}
          {activeTab === 'goals' && <GoalsPage goals={goals} updateGoal={updateGoal} navigate={navigate} />}
          {activeTab === 'profile' && <ProfilePage navigate={navigate} />}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => navigate(id)}><Icon size={19} /><span>{label}</span></button>)}
      </nav>

      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  )
}

function HomePage({ navigate, savedIds, completedIds, toggleSaved, toggleCompleted, overallProgress, goals }: { navigate: (tab: Tab) => void; savedIds: number[]; completedIds: number[]; toggleSaved: (id: number) => void; toggleCompleted: (id: number) => void; overallProgress: number; goals: Goal[] }) {
  const featured = experiences[0]
  return (
    <div className="page home-page">
      <section className="hero-intro">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" />{pageCopy.home.eyebrow}</div>
          <h1>{pageCopy.home.title}</h1>
          <p className="page-subtitle">{pageCopy.home.subtitle}</p>
        </div>
        <div className="couple-streak"><div className="streak-icon"><Heart size={17} fill="currentColor" /></div><div><strong>7 semanas</strong><span>cuidando do tempo de vocês</span></div></div>
      </section>

      <section className="hero-card">
        <div className="hero-card-copy">
          <span className="pill pill-light"><Sparkles size={13} /> sugestão feita para hoje</span>
          <div className="hero-card-kicker">45 MIN · EM CASA · R$ 60</div>
          <h2>Cozinhar algo novo<br /><em>juntos.</em></h2>
          <p>Uma receita nova, quatro mãos e nenhum compromisso com a perfeição.</p>
          <button className="button button-dark" onClick={() => navigate('discover')}>Ver experiência <ArrowRight size={16} /></button>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="sun-shape" />
          <div className="arch-shape" />
          <div className="illustration-card card-one"><Coffee size={20} /><span>receita<br /><strong>nova</strong></span></div>
          <div className="illustration-card card-two"><Heart size={19} fill="currentColor" /><span>tempo<br /><strong>de vocês</strong></span></div>
          <div className="illustration-word">nós</div>
          <div className="sparkle s1">✦</div><div className="sparkle s2">✦</div>
        </div>
      </section>

      <section className="section-heading home-section-heading"><div><div className="eyebrow"><span className="eyebrow-line" />visão de vocês</div><h2>Um pouco de cada vez.</h2></div><button className="text-button" onClick={() => navigate('goals')}>Ver objetivos <ArrowRight size={15} /></button></section>
      <section className="summary-grid">
        <div className="summary-card progress-card"><div className="summary-card-top"><div><span className="card-label">progresso geral</span><strong className="big-number">{overallProgress}<small>%</small></strong></div><div className="round-progress" style={{ '--progress': `${overallProgress * 3.6}deg` } as React.CSSProperties}><span>{overallProgress}%</span></div></div><div className="progress-track"><span style={{ width: `${overallProgress}%` }} /></div><p>Vocês estão criando um ritmo bonito de presença.</p></div>
        <div className="summary-card"><div className="summary-card-top"><div><span className="card-label">vividos este mês</span><strong className="big-number">{completedIds.length}<small>/ 4</small></strong></div><div className="summary-icon coral-icon"><Check size={20} /></div></div><p><strong>1 experiência</strong> foi concluída na última semana.</p><button className="inline-action" onClick={() => navigate('discover')}>Relembrar momentos <ArrowRight size={14} /></button></div>
        <div className="summary-card"><div className="summary-card-top"><div><span className="card-label">guardados para depois</span><strong className="big-number">{savedIds.length}<small> ideias</small></strong></div><div className="summary-icon lilac-icon"><Bookmark size={19} /></div></div><p>Uma lista pequena para quando bater aquela vontade.</p><button className="inline-action" onClick={() => navigate('discover')}>Abrir lista <ArrowRight size={14} /></button></div>
      </section>

      <section className="bottom-grid">
        <div className="panel upcoming-panel"><div className="panel-heading"><div><span className="card-label">próximo passo</span><h3>Um objetivo pede atenção</h3></div><button className="icon-button ghost" onClick={() => navigate('goals')}><ArrowRight size={17} /></button></div>{goals.slice(0, 2).map((goal) => <GoalMini key={goal.id} goal={goal} />)}</div>
        <div className="panel reflection-panel"><div className="quote-mark">“</div><p>O que fez vocês sorrirem juntos nos últimos dias?</p><div className="reflection-footer"><div className="avatar-stack"><div className="avatar avatar-tiny avatar-photo">Y</div><div className="avatar avatar-tiny avatar-photo second">M</div></div><span>uma pergunta para a noite</span><button className="round-arrow"><ArrowRight size={15} /></button></div></div>
      </section>
    </div>
  )
}

function GoalMini({ goal }: { goal: Goal }) {
  const Icon = goal.icon
  return <div className="goal-mini"><div className={`goal-icon ${goal.accent}`}><Icon size={17} /></div><div className="goal-mini-body"><div className="goal-mini-top"><strong>{goal.title}</strong><span>{goal.progress}/{goal.total}</span></div><div className="progress-track small"><span className={goal.accent} style={{ width: `${(goal.progress / goal.total) * 100}%` }} /></div><span className="goal-next">{goal.nextStep}</span></div><ChevronRight size={16} className="muted-chevron" /></div>
}

function DiscoverPage({ experiences: visibleExperiences, filters, setFilters, discoverMode, setDiscoverMode, savedIds, completedIds, toggleSaved, toggleCompleted, resetFilters }: { experiences: Experience[]; filters: Record<FilterKey, string>; setFilters: React.Dispatch<React.SetStateAction<Record<FilterKey, string>>>; discoverMode: DiscoverMode; setDiscoverMode: (mode: DiscoverMode) => void; savedIds: number[]; completedIds: number[]; toggleSaved: (id: number) => void; toggleCompleted: (id: number) => void; resetFilters: () => void }) {
  const setFilter = (key: FilterKey, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  return <div className="page discover-page"><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{pageCopy.discover.eyebrow}</div><h1>{pageCopy.discover.title}</h1><p className="page-subtitle">{pageCopy.discover.subtitle}</p></div><div className="heading-badge"><Compass size={17} /><span><strong>{visibleExperiences.length}</strong> ideias encontradas</span></div></section>
    <div className="filter-bar"><div className="filter-label"><Settings2 size={16} /> filtrar por</div><FilterSelect value={filters.time} options={['Qualquer duração', 'Até 30 min', 'Até 1 hora', 'Mais de 1 hora']} onChange={(value) => setFilter('time', value)} icon={Clock3} /><FilterSelect value={filters.budget} options={['Qualquer orçamento', 'Grátis', 'Até R$ 80', 'Até R$ 200']} onChange={(value) => setFilter('budget', value)} icon={WalletCards} /><FilterSelect value={filters.type} options={['Todos os tipos', 'Em casa', 'Lá fora', 'Conexão', 'Planos']} onChange={(value) => setFilter('type', value)} icon={Sparkles} /><button className="reset-button" onClick={resetFilters}><RotateCcw size={14} /> limpar</button></div>
    <div className="content-tabs"><div className="tab-buttons"><button className={discoverMode === 'all' ? 'active' : ''} onClick={() => setDiscoverMode('all')}>Todas as ideias <span>{experiences.length}</span></button><button className={discoverMode === 'saved' ? 'active' : ''} onClick={() => setDiscoverMode('saved')}>Salvas <span>{savedIds.length}</span></button><button className={discoverMode === 'completed' ? 'active' : ''} onClick={() => setDiscoverMode('completed')}>Vividas <span>{completedIds.length}</span></button></div><span className="tip"><Lightbulb size={15} /> vocês podem fazer do jeito de vocês</span></div>
    {visibleExperiences.length > 0 ? <div className="experience-grid">{visibleExperiences.map((experience) => <ExperienceCard key={experience.id} experience={experience} isSaved={savedIds.includes(experience.id)} isCompleted={completedIds.includes(experience.id)} toggleSaved={toggleSaved} toggleCompleted={toggleCompleted} />)}</div> : <EmptyState onReset={resetFilters} />}
  </div>
}

function FilterSelect({ value, options, onChange, icon: Icon }: { value: string; options: string[]; onChange: (value: string) => void; icon: LucideIcon }) { return <label className="filter-select"><Icon size={15} /><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label> }

function ExperienceCard({ experience, isSaved, isCompleted, toggleSaved, toggleCompleted }: { experience: Experience; isSaved: boolean; isCompleted: boolean; toggleSaved: (id: number) => void; toggleCompleted: (id: number) => void }) {
  const Icon = experience.icon
  return <article className={`experience-card ${isCompleted ? 'is-completed' : ''}`}><div className={`experience-visual ${experience.color}`}><div className="visual-pattern" /><div className="experience-icon"><Icon size={24} strokeWidth={1.7} /></div><button className={`save-button ${isSaved ? 'saved' : ''}`} onClick={() => toggleSaved(experience.id)} aria-label={isSaved ? 'Remover dos salvos' : 'Salvar experiência'}>{isSaved ? <BookmarkCheck size={17} fill="currentColor" /> : <Bookmark size={17} />}</button>{experience.tag && <span className="experience-tag">{experience.tag}</span>}{isCompleted && <span className="completed-chip"><Check size={13} /> vivido</span>}</div><div className="experience-body"><div className="experience-meta"><span>{experience.categoryLabel}</span><span className="dot-separator">·</span><span>{experience.duration}</span><span className="dot-separator">·</span><span>{experience.budget}</span></div><h3>{experience.title}</h3><p>{experience.description}</p><div className="experience-footer"><span className="location"><MapPin size={14} /> {experience.location}</span><button className={`complete-button ${isCompleted ? 'completed' : ''}`} onClick={() => toggleCompleted(experience.id)}>{isCompleted ? <><Check size={14} /> concluído</> : <>marcar como vivido <ArrowRight size={14} /></>}</button></div></div></article>
}

function EmptyState({ onReset }: { onReset: () => void }) { return <div className="empty-state"><div className="empty-icon"><Compass size={24} /></div><h3>Nenhuma ideia por aqui.</h3><p>Tentem abrir um pouco os filtros para encontrar um momento que caiba no agora.</p><button className="button button-outline" onClick={onReset}>Ver todas as ideias</button></div> }

function GoalsPage({ goals, updateGoal, navigate }: { goals: Goal[]; updateGoal: (id: number) => void; navigate: (tab: Tab) => void }) { return <div className="page goals-page"><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{pageCopy.goals.eyebrow}</div><h1>{pageCopy.goals.title}</h1><p className="page-subtitle">{pageCopy.goals.subtitle}</p></div><button className="button button-dark new-goal-button"><Plus size={17} /> novo objetivo</button></section><section className="goals-overview"><div className="overview-copy"><span className="card-label">ritmo de vocês</span><h2>O importante é continuar.</h2><p>Não existe meta pequena quando ela é feita a dois. Vocês já deram <strong>{goals.reduce((sum, goal) => sum + goal.progress, 0)} passos</strong> na direção do que querem viver.</p><button className="text-button" onClick={() => navigate('discover')}>Encontrar um próximo passo <ArrowRight size={15} /></button></div><div className="overview-chart"><div className="chart-ring"><div><strong>68</strong><span>dias de<br />presença</span></div></div><div className="chart-legend"><span><i className="legend-dot coral" /> momentos juntos</span><span><i className="legend-dot sage" /> conversas</span><span><i className="legend-dot lilac" /> planos</span></div></div></section><div className="goals-list-heading"><div><span className="card-label">objetivos ativos</span><h2>Do desejo ao hábito.</h2></div><span className="goal-count">{goals.length} objetivos <CheckCircle2 size={15} /></span></div><section className="goals-grid">{goals.map((goal) => <GoalCard key={goal.id} goal={goal} updateGoal={updateGoal} />)}</section></div> }

function GoalCard({ goal, updateGoal }: { goal: Goal; updateGoal: (id: number) => void }) { const Icon = goal.icon; const isDone = goal.progress >= goal.total; return <article className={`goal-card ${goal.accent}`}><div className="goal-card-top"><div className={`large-goal-icon ${goal.accent}`}><Icon size={22} /></div><button className="icon-button ghost"><MoreHorizontal size={18} /></button></div><div className="goal-card-copy"><span className="card-label">objetivo compartilhado</span><h3>{goal.title}</h3><p>{goal.description}</p></div><div className="goal-progress-row"><strong>{goal.progress}<span>/{goal.total}</span></strong><div className="progress-track"><span className={goal.accent} style={{ width: `${(goal.progress / goal.total) * 100}%` }} /></div><span>{Math.round((goal.progress / goal.total) * 100)}%</span></div><div className="goal-card-footer"><span><TrendingUp size={14} /> {isDone ? 'Objetivo concluído' : goal.nextStep}</span><button className={`advance-button ${isDone ? 'done' : ''}`} onClick={() => !isDone && updateGoal(goal.id)}>{isDone ? <Check size={15} /> : <><Plus size={14} /> avançar</>}</button></div></article> }

function ProfilePage({ navigate }: { navigate: (tab: Tab) => void }) { return <div className="page profile-page"><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{pageCopy.profile.eyebrow}</div><h1>{pageCopy.profile.title}</h1><p className="page-subtitle">{pageCopy.profile.subtitle}</p></div><button className="icon-button settings-button"><Settings2 size={18} /></button></section><section className="profile-hero"><div className="profile-avatars"><div className="avatar avatar-large avatar-photo">Y</div><div className="avatar avatar-large avatar-photo second">M</div><div className="profile-heart"><Heart size={17} fill="currentColor" /></div></div><div className="profile-identity"><span className="card-label">nosso perfil</span><h2>Yuri & Marina</h2><p>Juntos desde novembro de 2023 · São Paulo, SP</p><button className="text-button">editar perfil <ArrowRight size={14} /></button></div><div className="profile-quote"><span>“</span><p>o amor mora<br />nos detalhes</p></div></section><div className="profile-columns"><section className="panel preferences-panel"><div className="panel-heading"><div><span className="card-label">preferências do casal</span><h3>Do jeito de vocês</h3></div><button className="icon-button ghost"><Settings2 size={16} /></button></div><div className="preference-list"><PreferenceRow icon={Clock3} label="Tempo disponível" value="Até 1 hora" /><PreferenceRow icon={WalletCards} label="Orçamento comum" value="Até R$ 80" /><PreferenceRow icon={HeartHandshake} label="O que conecta" value="Conversas & novidades" /><PreferenceRow icon={MapPin} label="Onde costumam estar" value="Em casa e perto" /></div></section><section className="panel about-panel"><div className="panel-heading"><div><span className="card-label">sobre o espaço</span><h3>Um lugar só de vocês</h3></div><Heart size={19} className="coral-text" fill="currentColor" /></div><p>O Nós foi pensado para tirar o relacionamento do piloto automático — com leveza, curiosidade e ideias possíveis para a vida real.</p><div className="about-stat"><div><strong>03</strong><span>anos de história</span></div><div><strong>24</strong><span>momentos vividos</span></div><div><strong>07</strong><span>salvos para depois</span></div></div><button className="button button-outline full-button" onClick={() => navigate('discover')}>explorar ideias <Compass size={16} /></button></section></div></div> }

function PreferenceRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) { return <div className="preference-row"><div className="preference-icon"><Icon size={17} /></div><div><span>{label}</span><strong>{value}</strong></div><ChevronRight size={16} className="muted-chevron" /></div> }

function tabFromPath(): Tab { const path = window.location.pathname; if (path.includes('descobrir')) return 'discover'; if (path.includes('objetivos')) return 'goals'; if (path.includes('perfil')) return 'profile'; return 'home' }

export default App
