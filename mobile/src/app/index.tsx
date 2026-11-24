import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Session } from '@supabase/supabase-js'

import { communityCouples, experiences, initialGoals } from '../data/demo'
import { getCurrentSession, isSupabaseConfigured, signInWithPassword, signOut, signUpWithPassword, supabase } from '../lib/supabase'
import type { AccountProfile, CoupleConnection, Experience, Goal, Tab } from '../types'

const STORAGE_KEY = 'nos:mobile-state'

const defaultAccount: AccountProfile = { name: 'Yuri', email: 'yuri@nos.app' }
const defaultConnection: CoupleConnection = {
  linked: true,
  coupleName: 'Yuri & Vitoria',
  partnerName: 'Vitoria',
  inviteCode: 'NOS-YV4K',
  joinedAt: 'há 4 anos',
}

type PersistedState = {
  account: AccountProfile
  connection: CoupleConnection
  savedIds: number[]
  completedIds: number[]
  goals: Goal[]
}

type ModalName = 'join' | 'account' | 'auth' | null

type IconName = 'home' | 'discover' | 'goals' | 'community' | 'account' | 'heart' | 'pin' | 'spark' | 'lock' | 'check' | 'link' | 'arrow'

function Glyph({ name, size = 20, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  const glyphs: Record<IconName, string> = {
    home: '⌂',
    discover: '⌕',
    goals: '◒',
    community: '♧',
    account: '◉',
    heart: '♡',
    pin: '⌖',
    spark: '✦',
    lock: '⌑',
    check: '✓',
    link: '↗',
    arrow: '→',
  }
  return <Text style={{ color, fontSize: size, lineHeight: size + 2 }}>{glyphs[name]}</Text>
}

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [account, setAccount] = useState<AccountProfile>(defaultAccount)
  const [connection, setConnection] = useState<CoupleConnection>(defaultConnection)
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [completedIds, setCompletedIds] = useState<number[]>([])
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [modal, setModal] = useState<ModalName>(null)
  const [toast, setToast] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [accountDraft, setAccountDraft] = useState(defaultAccount)
  const [session, setSession] = useState<Session | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return
        const stored = JSON.parse(raw) as Partial<PersistedState>
        if (stored.account) setAccount(stored.account)
        if (stored.connection) setConnection(stored.connection)
        if (stored.savedIds) setSavedIds(stored.savedIds)
        if (stored.completedIds) setCompletedIds(stored.completedIds)
        if (stored.goals) setGoals(stored.goals)
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const state: PersistedState = { account, connection, savedIds, completedIds, goals }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined)
  }, [account, connection, savedIds, completedIds, goals, hydrated])

  useEffect(() => {
    if (!supabase) return
    getCurrentSession().then(setSession).catch(() => undefined)
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const completedCount = completedIds.length
  const savedCount = savedIds.length
  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.total, 0)

  const showToast = (message: string) => setToast(message)

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab)
    if (nextTab !== 'account' && !connection.linked) showToast('Conecte-se a um casal para desbloquear esta área.')
  }

  const openExternal = async (experience: Experience) => {
    try {
      await Linking.openURL(experience.resource.url)
    } catch {
      showToast('Não foi possível abrir este link agora.')
    }
  }

  const toggleSaved = (id: number) => {
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    showToast(savedIds.includes(id) ? 'Ideia removida das salvas.' : 'Ideia salva para depois.')
  }

  const toggleCompleted = (id: number) => {
    setCompletedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    showToast(completedIds.includes(id) ? 'Experiência reaberta.' : 'Momento marcado como vivido. +20 pontos')
  }

  const advanceGoal = (id: number) => {
    setGoals((current) => current.map((goal) => goal.id === id ? { ...goal, progress: Math.min(goal.total, goal.progress + 1) } : goal))
    showToast('Objetivo atualizado. Mais um passo de vocês.')
  }

  const joinCouple = () => {
    const normalized = joinCode.trim().toUpperCase()
    if (normalized.length < 5) {
      showToast('Digite um código de convite válido.')
      return
    }
    setConnection({ linked: true, coupleName: 'Yuri & Vitoria', partnerName: 'Vitoria', inviteCode: normalized, joinedAt: 'agora' })
    setJoinCode('')
    setModal(null)
    setTab('home')
    showToast('Casal conectado. As áreas compartilhadas estão liberadas.')
  }

  const saveAccount = () => {
    setAccount(accountDraft)
    setModal(null)
    showToast('Dados da sua conta atualizados.')
  }

  const leaveCouple = () => {
    Alert.alert('Sair do casal?', 'As atividades demonstrativas ficarão bloqueadas até você entrar em outro casal.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => { setConnection({ ...defaultConnection, linked: false, partnerName: '', coupleName: '', joinedAt: '' }); setTab('account'); showToast('Você voltou para o espaço pessoal.') } },
    ])
  }

  const submitAuth = async () => {
    if (!authEmail.trim() || authPassword.length < 6) {
      showToast('Informe um e-mail e uma senha com pelo menos 6 caracteres.')
      return
    }
    setAuthBusy(true)
    try {
      const nextSession = authMode === 'login'
        ? await signInWithPassword(authEmail.trim(), authPassword)
        : await signUpWithPassword(authEmail.trim(), authPassword)
      setSession(nextSession)
      setModal(null)
      showToast(nextSession ? 'Sessão iniciada com sucesso.' : 'Verifique seu e-mail para confirmar a conta.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.')
    } finally {
      setAuthBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setSession(null)
    showToast('Sessão encerrada neste dispositivo.')
  }

  const locked = tab !== 'account' && !connection.linked

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>nós</Text>
            <Text style={styles.brandSub}>cultive o que vocês têm</Text>
          </View>
          <View style={styles.topActions}>
            <View style={styles.statusDot} />
            <Pressable onPress={() => setModal('account')} style={styles.avatar} accessibilityLabel="Editar conta">
              <Text style={styles.avatarText}>{account.name.charAt(0).toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {locked ? <LockedState onConnect={() => setModal('join')} /> : (
            <>
              {tab === 'home' && <HomeScreen account={account} connection={connection} goals={goals} completedCount={completedCount} savedCount={savedCount} totalProgress={totalProgress} totalTarget={totalTarget} onDiscover={() => setTab('discover')} />}
              {tab === 'discover' && <DiscoverScreen savedIds={savedIds} completedIds={completedIds} onSave={toggleSaved} onComplete={toggleCompleted} onOpen={openExternal} />}
              {tab === 'goals' && <GoalsScreen goals={goals} onAdvance={advanceGoal} />}
              {tab === 'community' && <CommunityScreen connection={connection} />}
            </>
          )}
          {tab === 'account' && <AccountScreen account={account} connection={connection} session={session} onEdit={() => { setAccountDraft(account); setModal('account') }} onJoin={() => setModal('join')} onLeave={leaveCouple} onAuth={() => setModal('auth')} onSignOut={handleSignOut} />}
        </ScrollView>

        <View style={styles.bottomNav}>
          <NavItem label="Início" icon="home" active={tab === 'home'} onPress={() => selectTab('home')} />
          <NavItem label="Descobrir" icon="discover" active={tab === 'discover'} onPress={() => selectTab('discover')} />
          <NavItem label="Objetivos" icon="goals" active={tab === 'goals'} onPress={() => selectTab('goals')} />
          <NavItem label="Comunidade" icon="community" active={tab === 'community'} onPress={() => selectTab('community')} />
          <NavItem label="Conta" icon="account" active={tab === 'account'} onPress={() => selectTab('account')} />
        </View>
      </View>

      <Modal visible={modal !== null} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.modalBackdrop}>
          {modal === 'join' && <JoinModal code={joinCode} setCode={setJoinCode} onClose={() => setModal(null)} onJoin={joinCouple} />}
          {modal === 'account' && <AccountModal draft={accountDraft} setDraft={setAccountDraft} onClose={() => setModal(null)} onSave={saveAccount} />}
          {modal === 'auth' && <AuthModal mode={authMode} setMode={setAuthMode} email={authEmail} password={authPassword} setEmail={setAuthEmail} setPassword={setAuthPassword} busy={authBusy} onClose={() => setModal(null)} onSubmit={submitAuth} />}
        </View>
      </Modal>

      {!!toast && <View style={styles.toast}><Glyph name="check" size={16} color={colors.sageDark} /><Text style={styles.toastText}>{toast}</Text></View>}
    </SafeAreaView>
  )
}

function HomeScreen({ account, connection, goals, completedCount, savedCount, totalProgress, totalTarget, onDiscover }: { account: AccountProfile; connection: CoupleConnection; goals: Goal[]; completedCount: number; savedCount: number; totalProgress: number; totalTarget: number; onDiscover: () => void }) {
  const featured = experiences[0]
  return <View>
    <Text style={styles.eyebrow}>um espaço para vocês dois</Text>
    <Text style={styles.title}>Oi, {account.name}.<Text style={styles.titleAccent}>{'\n'}Vamos cuidar do nós?</Text></Text>
    <Text style={styles.subtitle}>{connection.coupleName} · juntos {connection.joinedAt}</Text>

    <View style={styles.featureCard}>
      <View style={styles.featureCopy}>
        <View style={styles.pill}><Glyph name="spark" size={13} color={colors.coralDark} /><Text style={styles.pillText}>uma ideia possível para hoje</Text></View>
        <Text style={styles.featureTitle}>{featured.title}</Text>
        <Text style={styles.featureDescription}>{featured.description}</Text>
        <Pressable onPress={onDiscover} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Ver ideias</Text><Glyph name="arrow" size={17} color={colors.white} /></Pressable>
      </View>
      <View style={styles.featureArt}><Text style={styles.artHeart}>♡</Text><Text style={styles.artWord}>juntos</Text></View>
    </View>

    <Text style={styles.sectionLabel}>o ritmo de vocês</Text>
    <View style={styles.statGrid}>
      <StatCard label="momentos vividos" value={String(completedCount)} hint="neste ciclo" accent="coral" />
      <StatCard label="ideias salvas" value={String(savedCount)} hint="para escolher depois" accent="sage" />
      <StatCard label="progresso" value={`${totalProgress}/${totalTarget}`} hint="nos objetivos" accent="lilac" />
    </View>

    <Text style={styles.sectionLabel}>objetivos em movimento</Text>
    {goals.slice(0, 2).map((goal) => <View key={goal.id} style={styles.goalRow}><View style={[styles.goalDot, { backgroundColor: goal.accent === 'coral' ? colors.coral : goal.accent === 'sage' ? colors.sage : colors.lilac }]} /><View style={styles.goalRowBody}><View style={styles.rowBetween}><Text style={styles.goalRowTitle}>{goal.title}</Text><Text style={styles.meta}>{goal.progress}/{goal.total}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (goal.progress / goal.total) * 100)}%`, backgroundColor: goal.accent === 'coral' ? colors.coral : goal.accent === 'sage' ? colors.sageDark : colors.lilac }]} /></View><Text style={styles.meta}>{goal.nextStep}</Text></View></View>)}
  </View>
}

function DiscoverScreen({ savedIds, completedIds, onSave, onComplete, onOpen }: { savedIds: number[]; completedIds: number[]; onSave: (id: number) => void; onComplete: (id: number) => void; onOpen: (experience: Experience) => void }) {
  const [category, setCategory] = useState<'todas' | 'casa' | 'fora' | 'conexao'>('todas')
  const filtered = useMemo(() => category === 'todas' ? experiences : experiences.filter((experience) => experience.category === category), [category])
  return <View>
    <Text style={styles.eyebrow}>descobrir juntos</Text>
    <Text style={styles.pageTitle}>Pequenos planos,{`\n`}grandes memórias.</Text>
    <Text style={styles.subtitle}>Sugestões realistas para o tempo, o orçamento e a energia de vocês.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
      {(['todas', 'casa', 'fora', 'conexao'] as const).map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item === 'todas' ? 'Todas' : item === 'casa' ? 'Em casa' : item === 'fora' ? 'Lá fora' : 'Conexão'}</Text></Pressable>)}
    </ScrollView>
    {filtered.map((experience) => <ExperienceCard key={experience.id} experience={experience} saved={savedIds.includes(experience.id)} completed={completedIds.includes(experience.id)} onSave={onSave} onComplete={onComplete} onOpen={onOpen} />)}
  </View>
}

function ExperienceCard({ experience, saved, completed, onSave, onComplete, onOpen }: { experience: Experience; saved: boolean; completed: boolean; onSave: (id: number) => void; onComplete: (id: number) => void; onOpen: (experience: Experience) => void }) {
  return <View style={styles.experienceCard}>
    <View style={styles.experienceTop}><View style={styles.experienceIcon}><Glyph name={experience.category === 'fora' ? 'pin' : experience.category === 'conexao' ? 'heart' : 'spark'} size={23} color={colors.ink} /></View><Pressable onPress={() => onSave(experience.id)} style={[styles.saveButton, saved && styles.saveButtonActive]}><Text style={[styles.saveText, saved && styles.saveTextActive]}>{saved ? '♥' : '♡'}</Text></Pressable></View>
    <View style={styles.experienceBody}><View style={styles.rowBetween}><Text style={styles.category}>{experience.categoryLabel}</Text><Text style={styles.meta}>{experience.duration} · {experience.budget}</Text></View><Text style={styles.cardTitle}>{experience.title}</Text><Text style={styles.cardDescription}>{experience.description}</Text><View style={styles.cardFooter}><Text style={styles.location}>{experience.location}</Text><Pressable onPress={() => onComplete(experience.id)} style={styles.smallAction}><Text style={[styles.smallActionText, completed && styles.completedText]}>{completed ? 'Vivido ✓' : 'Marcar vivido'}</Text></Pressable></View><Pressable onPress={() => onOpen(experience)} style={styles.linkAction}><Text style={styles.linkActionText}>{experience.resource.label}</Text><Glyph name="link" size={15} color={colors.coralDark} /></Pressable></View>
  </View>
}

function GoalsScreen({ goals, onAdvance }: { goals: Goal[]; onAdvance: (id: number) => void }) {
  const progress = goals.reduce((sum, goal) => sum + goal.progress, 0)
  const total = goals.reduce((sum, goal) => sum + goal.total, 0)
  return <View>
    <Text style={styles.eyebrow}>objetivos compartilhados</Text>
    <Text style={styles.pageTitle}>O que vocês querem{`\n`}cultivar juntos?</Text>
    <View style={styles.overviewCard}><Text style={styles.overviewKicker}>progresso do casal</Text><Text style={styles.overviewNumber}>{progress}<Text style={styles.overviewSmall}>/{total} passos</Text></Text><View style={styles.progressTrackLight}><View style={[styles.progressFill, { width: `${(progress / total) * 100}%`, backgroundColor: colors.sageDark }]} /></View><Text style={styles.overviewHint}>Cada avanço conta, mesmo os pequenos.</Text></View>
    {goals.map((goal) => <View key={goal.id} style={styles.goalCard}><View style={styles.rowBetween}><View style={[styles.goalBadge, { backgroundColor: goal.accent === 'coral' ? colors.coralSoft : goal.accent === 'sage' ? colors.sageSoft : colors.lilacSoft }]}><Glyph name={goal.accent === 'lilac' ? 'spark' : 'heart'} size={18} color={goal.accent === 'coral' ? colors.coralDark : goal.accent === 'sage' ? colors.sageDark : colors.lilacDark} /></View><Text style={styles.meta}>{goal.progress}/{goal.total}</Text></View><Text style={styles.cardTitle}>{goal.title}</Text><Text style={styles.cardDescription}>{goal.description}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(goal.progress / goal.total) * 100}%`, backgroundColor: goal.accent === 'coral' ? colors.coral : goal.accent === 'sage' ? colors.sageDark : colors.lilac }]} /></View><View style={styles.goalCardFooter}><Text style={styles.meta}>{goal.nextStep}</Text><Pressable onPress={() => onAdvance(goal.id)} style={styles.advanceButton}><Text style={styles.advanceButtonText}>{goal.progress >= goal.total ? 'Concluído' : 'Avançar'}</Text></Pressable></View></View>)}
  </View>
}

function CommunityScreen({ connection }: { connection: CoupleConnection }) {
  return <View>
    <Text style={styles.eyebrow}>comunidade</Text>
    <Text style={styles.pageTitle}>Inspirar sem comparar.{`\n`}Competir com carinho.</Text>
    <Text style={styles.subtitle}>Veja o que outros casais estão cultivando. Só aparece o que eles escolheram compartilhar.</Text>
    <View style={styles.scoreCard}><View><Text style={styles.scoreKicker}>placar desta semana</Text><Text style={styles.scoreNumber}>340<Text style={styles.scoreUnit}> pts</Text></Text><Text style={styles.scoreHint}>{connection.coupleName || 'Seu casal'} · posição 4</Text></View><View style={styles.scoreCircle}><Text style={styles.scoreCircleText}>+20</Text><Text style={styles.scoreCircleHint}>próximo</Text></View></View>
    <Text style={styles.sectionLabel}>ranking entre amigos</Text>
    <View style={styles.leaderboard}><View style={[styles.leaderRow, styles.yourRow]}><Text style={styles.position}>4</Text><View style={[styles.communityAvatar, styles.avatarCoral]}><Text style={styles.communityAvatarText}>YV</Text></View><View style={styles.leaderCopy}><Text style={styles.leaderName}>{connection.coupleName || 'Seu casal'}</Text><Text style={styles.meta}>Florianópolis · 340 pts</Text></View><Text style={styles.trophy}>♡</Text></View>{communityCouples.map((couple) => <View key={couple.id} style={styles.leaderRow}><Text style={styles.position}>{couple.position}</Text><View style={[styles.communityAvatar, couple.accent === 'coral' ? styles.avatarCoral : couple.accent === 'sage' ? styles.avatarSage : styles.avatarLilac]}><Text style={styles.communityAvatarText}>{couple.initials}</Text></View><View style={styles.leaderCopy}><Text style={styles.leaderName}>{couple.names}</Text><Text style={styles.meta}>{couple.city} · {couple.streak}</Text></View><Text style={styles.points}>{couple.points}</Text></View>)}</View>
  </View>
}

function AccountScreen({ account, connection, session, onEdit, onJoin, onLeave, onAuth, onSignOut }: { account: AccountProfile; connection: CoupleConnection; session: Session | null; onEdit: () => void; onJoin: () => void; onLeave: () => void; onAuth: () => void; onSignOut: () => void }) {
  return <View>
    <Text style={styles.eyebrow}>minha conta</Text>
    <Text style={styles.pageTitle}>Seu espaço,{`\n`}do seu jeito.</Text>
    <View style={styles.accountCard}><View style={styles.accountAvatar}><Text style={styles.accountAvatarText}>{account.name.charAt(0).toUpperCase()}</Text></View><View style={styles.accountCopy}><Text style={styles.accountName}>{account.name}</Text><Text style={styles.meta}>{account.email}</Text></View><Pressable onPress={onEdit} style={styles.editButton}><Text style={styles.editButtonText}>Editar</Text></Pressable></View>
    <View style={[styles.connectionCard, !connection.linked && styles.connectionCardUnlinked]}><View style={styles.connectionIcon}><Glyph name={connection.linked ? 'heart' : 'lock'} size={22} color={connection.linked ? colors.sageDark : colors.coralDark} /></View><View style={styles.connectionCopy}><Text style={styles.connectionTitle}>{connection.linked ? connection.coupleName : 'Você está no espaço pessoal'}</Text><Text style={styles.connectionDescription}>{connection.linked ? `Conectado com ${connection.partnerName} · código ${connection.inviteCode}` : 'Entre em um casal para liberar experiências, objetivos e comunidade.'}</Text></View></View>
    <Pressable onPress={connection.linked ? onLeave : onJoin} style={connection.linked ? styles.outlineButton : styles.primaryButton}><Text style={connection.linked ? styles.outlineButtonText : styles.primaryButtonText}>{connection.linked ? 'Gerenciar vínculo' : 'Entrar em um casal'}</Text><Glyph name={connection.linked ? 'link' : 'arrow'} size={17} color={connection.linked ? colors.ink : colors.white} /></Pressable>
    <View style={styles.backendCard}><View style={styles.rowBetween}><Text style={styles.sectionTitle}>Sincronização</Text><View style={[styles.configBadge, { backgroundColor: isSupabaseConfigured ? colors.sageSoft : colors.yellowSoft }]}><Text style={[styles.configBadgeText, { color: isSupabaseConfigured ? colors.sageDark : colors.yellowDark }]}>{isSupabaseConfigured ? 'Supabase pronto' : 'Modo demonstração'}</Text></View></View><Text style={styles.cardDescription}>{isSupabaseConfigured ? session ? `Sessão ativa para ${session.user.email ?? account.email}.` : 'O backend está configurado. Entre para sincronizar sua conta.' : 'O app funciona localmente agora. Configure o Supabase para entrar e sincronizar em vários aparelhos.'}</Text><Pressable onPress={session ? onSignOut : onAuth} style={styles.linkAction}><Text style={styles.linkActionText}>{session ? 'Encerrar sessão' : 'Entrar ou criar conta'}</Text><Glyph name="arrow" size={15} color={colors.coralDark} /></Pressable></View>
  </View>
}

function LockedState({ onConnect }: { onConnect: () => void }) {
  return <View style={styles.lockedState}><View style={styles.lockOrbit}><Glyph name="lock" size={28} color={colors.coralDark} /></View><Text style={styles.pageTitle}>Esse espaço é{`\n`}de vocês dois.</Text><Text style={styles.subtitle}>Conecte sua conta individual a um casal para desbloquear experiências, objetivos, comunidade e progresso compartilhado.</Text><Pressable onPress={onConnect} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Conectar ao casal</Text><Glyph name="arrow" size={17} color={colors.white} /></Pressable></View>
}

function NavItem({ label, icon, active, onPress }: { label: string; icon: IconName; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.navItem}><Glyph name={icon} size={22} color={active ? colors.coralDark : colors.muted} /><Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text></Pressable>
}

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: 'coral' | 'sage' | 'lilac' }) {
  return <View style={[styles.statCard, { borderTopColor: accent === 'coral' ? colors.coral : accent === 'sage' ? colors.sage : colors.lilac }]}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text><Text style={styles.meta}>{hint}</Text></View>
}

function JoinModal({ code, setCode, onClose, onJoin }: { code: string; setCode: (value: string) => void; onClose: () => void; onJoin: () => void }) {
  return <View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.eyebrow}>vínculo de casal</Text><Text style={styles.modalTitle}>Entrar em um casal</Text></View><Pressable onPress={onClose}><Text style={styles.closeButton}>×</Text></Pressable></View><Text style={styles.cardDescription}>Peça o código para a outra pessoa e digite aqui. No produto real, o convite será validado pelo servidor.</Text><TextInput autoCapitalize="characters" value={code} onChangeText={setCode} placeholder="Ex.: NOS-YV4K" placeholderTextColor={colors.placeholder} style={styles.input} /><View style={styles.modalActions}><Pressable onPress={onClose} style={styles.outlineButton}><Text style={styles.outlineButtonText}>Cancelar</Text></Pressable><Pressable onPress={onJoin} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Conectar</Text></Pressable></View></View>
}

function AccountModal({ draft, setDraft, onClose, onSave }: { draft: AccountProfile; setDraft: (value: AccountProfile) => void; onClose: () => void; onSave: () => void }) {
  return <View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.eyebrow}>conta individual</Text><Text style={styles.modalTitle}>Seus dados</Text></View><Pressable onPress={onClose}><Text style={styles.closeButton}>×</Text></Pressable></View><Text style={styles.inputLabel}>Nome</Text><TextInput value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} style={styles.input} placeholder="Seu nome" placeholderTextColor={colors.placeholder} /><Text style={styles.inputLabel}>E-mail</Text><TextInput value={draft.email} onChangeText={(email) => setDraft({ ...draft, email })} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholder="voce@email.com" placeholderTextColor={colors.placeholder} /><View style={styles.modalActions}><Pressable onPress={onClose} style={styles.outlineButton}><Text style={styles.outlineButtonText}>Cancelar</Text></Pressable><Pressable onPress={onSave} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Salvar</Text></Pressable></View></View>
}

function AuthModal({ mode, setMode, email, password, setEmail, setPassword, busy, onClose, onSubmit }: { mode: 'login' | 'signup'; setMode: (mode: 'login' | 'signup') => void; email: string; password: string; setEmail: (value: string) => void; setPassword: (value: string) => void; busy: boolean; onClose: () => void; onSubmit: () => void }) {
  return <View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.eyebrow}>conta real</Text><Text style={styles.modalTitle}>{mode === 'login' ? 'Entrar no Nós' : 'Criar sua conta'}</Text></View><Pressable onPress={onClose}><Text style={styles.closeButton}>×</Text></Pressable></View><Text style={styles.cardDescription}>Use seu e-mail para manter a conta individual e acessar o casal em qualquer aparelho.</Text><Text style={styles.inputLabel}>E-mail</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholder="voce@email.com" placeholderTextColor={colors.placeholder} /><Text style={styles.inputLabel}>Senha</Text><TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholder="Mínimo de 6 caracteres" placeholderTextColor={colors.placeholder} /><Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}><Text style={styles.switchAuth}>{mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</Text></Pressable><View style={styles.modalActions}><Pressable onPress={onClose} style={styles.outlineButton}><Text style={styles.outlineButtonText}>Cancelar</Text></Pressable><Pressable disabled={busy} onPress={onSubmit} style={styles.primaryButton}>{busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>}</Pressable></View></View>
}

const colors = {
  background: '#F7F5EF',
  surface: '#FFFCF6',
  ink: '#293632',
  muted: '#929990',
  coral: '#D8785C',
  coralDark: '#B65D49',
  coralSoft: '#F6E1D8',
  sage: '#B9CEB9',
  sageDark: '#5F7B66',
  sageSoft: '#E4EEE1',
  lilac: '#9A87B7',
  lilacDark: '#76658F',
  lilacSoft: '#EEE8F3',
  yellowSoft: '#F6EBC8',
  yellowDark: '#90722C',
  white: '#FFFDF7',
  line: '#E7E3D9',
  placeholder: '#B9BBB1',
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  appShell: { flex: 1 },
  topBar: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { color: colors.ink, fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', letterSpacing: -1 },
  brandSub: { color: colors.muted, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.coral },
  avatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#EABBA7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#6F4A42', fontFamily: 'Georgia', fontWeight: '700', fontSize: 15 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 105 },
  eyebrow: { color: '#9A9B90', fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: colors.ink, fontFamily: 'Georgia', fontSize: 34, lineHeight: 37, fontWeight: '700', marginTop: 12 },
  titleAccent: { color: colors.coralDark, fontStyle: 'italic' },
  pageTitle: { color: colors.ink, fontFamily: 'Georgia', fontSize: 31, lineHeight: 34, fontWeight: '700', marginTop: 12, marginBottom: 10 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 22 },
  featureCard: { minHeight: 300, borderRadius: 18, overflow: 'hidden', backgroundColor: '#E9CBB7', marginBottom: 28 },
  featureCopy: { padding: 22, paddingBottom: 25 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,249,241,.6)' },
  pillText: { color: '#96644F', fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  featureTitle: { color: '#493B37', fontFamily: 'Georgia', fontSize: 27, lineHeight: 29, fontWeight: '700', marginTop: 24, marginBottom: 9, maxWidth: 260 },
  featureDescription: { color: '#81675D', fontSize: 12, lineHeight: 18, maxWidth: 300, marginBottom: 19 },
  featureArt: { height: 120, backgroundColor: '#E3AD9B', position: 'relative', overflow: 'hidden' },
  artHeart: { position: 'absolute', color: '#FFF4D7', fontFamily: 'Georgia', fontSize: 125, lineHeight: 130, right: 47, top: -23 },
  artWord: { position: 'absolute', color: 'rgba(255,245,226,.9)', fontFamily: 'Georgia', fontSize: 43, fontStyle: 'italic', left: 22, bottom: 18, transform: [{ rotate: '-8deg' }] },
  primaryButton: { minHeight: 42, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#2D3A36', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, alignSelf: 'flex-start' },
  primaryButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  outlineButton: { minHeight: 42, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#D5D3C8', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, alignSelf: 'flex-start' },
  outlineButtonText: { color: '#5F6B63', fontSize: 12, fontWeight: '700' },
  sectionLabel: { color: '#9A9B90', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 4, marginBottom: 12 },
  statGrid: { flexDirection: 'row', gap: 9, marginBottom: 27 },
  statCard: { flex: 1, minHeight: 108, padding: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderTopWidth: 3 },
  statLabel: { color: '#9A9D94', fontSize: 9, lineHeight: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  statValue: { color: '#384640', fontFamily: 'Georgia', fontSize: 25, fontWeight: '700', marginVertical: 9 },
  meta: { color: '#A0A49B', fontSize: 10, lineHeight: 15 },
  goalRow: { flexDirection: 'row', gap: 11, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line },
  goalDot: { width: 31, height: 31, borderRadius: 10, marginTop: 1 },
  goalRowBody: { flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  goalRowTitle: { color: '#58635B', fontSize: 12, fontWeight: '600', flex: 1 },
  progressTrack: { height: 6, backgroundColor: '#EDEBE4', borderRadius: 10, overflow: 'hidden', marginVertical: 8 },
  progressTrackLight: { height: 8, backgroundColor: 'rgba(95,123,102,.17)', borderRadius: 10, overflow: 'hidden', marginVertical: 16 },
  progressFill: { height: '100%', borderRadius: 10 },
  chipsRow: { gap: 7, paddingBottom: 17 },
  chip: { borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#EFEDE6' },
  chipActive: { backgroundColor: colors.coralSoft },
  chipText: { color: '#929990', fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: colors.coralDark },
  experienceCard: { borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', marginBottom: 14 },
  experienceTop: { height: 104, backgroundColor: '#E8C3B0', padding: 15, flexDirection: 'row', justifyContent: 'space-between' },
  experienceIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,249,237,.75)', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] },
  saveButton: { width: 31, height: 31, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,.5)', backgroundColor: 'rgba(93,79,66,.12)', alignItems: 'center', justifyContent: 'center' },
  saveButtonActive: { backgroundColor: '#FFF7E9', borderColor: '#F4D3C6' },
  saveText: { color: colors.white, fontSize: 21, lineHeight: 24 },
  saveTextActive: { color: colors.coralDark },
  experienceBody: { padding: 15 },
  category: { color: '#A0A39A', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  cardTitle: { color: '#45534C', fontFamily: 'Georgia', fontSize: 20, lineHeight: 22, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  cardDescription: { color: '#929890', fontSize: 11, lineHeight: 17, marginBottom: 13 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#EEEBE4', paddingTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  location: { color: '#A2A59C', fontSize: 10, flex: 1 },
  smallAction: { paddingVertical: 4, paddingLeft: 8 },
  smallActionText: { color: colors.coralDark, fontSize: 10, fontWeight: '700' },
  completedText: { color: colors.sageDark },
  linkAction: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12, alignSelf: 'flex-start' },
  linkActionText: { color: colors.coralDark, fontSize: 11, fontWeight: '700' },
  overviewCard: { borderRadius: 16, padding: 20, backgroundColor: colors.sageSoft, marginBottom: 17 },
  overviewKicker: { color: colors.sageDark, fontSize: 10, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  overviewNumber: { color: '#4D6954', fontFamily: 'Georgia', fontSize: 45, fontWeight: '700', marginTop: 8 },
  overviewSmall: { color: '#829184', fontFamily: 'System', fontSize: 13, fontWeight: '400' },
  overviewHint: { color: '#77877B', fontSize: 11 },
  goalCard: { borderRadius: 14, padding: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginBottom: 12 },
  goalBadge: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  goalCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEEBE4' },
  advanceButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.coralSoft },
  advanceButtonText: { color: colors.coralDark, fontSize: 10, fontWeight: '700' },
  scoreCard: { borderRadius: 16, padding: 20, backgroundColor: '#F0D3C3', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 27 },
  scoreKicker: { color: '#99786A', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  scoreNumber: { color: '#705246', fontFamily: 'Georgia', fontSize: 41, fontWeight: '700', marginTop: 7 },
  scoreUnit: { fontFamily: 'System', fontSize: 12, fontWeight: '400' },
  scoreHint: { color: '#99786A', fontSize: 10, marginTop: 4 },
  scoreCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,249,238,.65)', alignItems: 'center', justifyContent: 'center' },
  scoreCircleText: { color: '#B65D49', fontFamily: 'Georgia', fontSize: 21, fontWeight: '700' },
  scoreCircleHint: { color: '#A98273', fontSize: 9, marginTop: 3 },
  leaderboard: { borderRadius: 14, paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  leaderRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#EEEBE4' },
  yourRow: { marginHorizontal: -5, paddingHorizontal: 5, backgroundColor: '#FFF8EE', borderRadius: 9 },
  position: { width: 17, color: '#AAA9A1', fontFamily: 'Georgia', fontSize: 18, textAlign: 'center' },
  communityAvatar: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarCoral: { backgroundColor: '#F3D6CB' },
  avatarSage: { backgroundColor: '#DCE9DA' },
  avatarLilac: { backgroundColor: '#E7E0EF' },
  communityAvatarText: { color: '#6E655B', fontSize: 9, fontWeight: '800' },
  leaderCopy: { flex: 1 },
  leaderName: { color: '#59645D', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  trophy: { color: colors.coralDark, fontSize: 21 },
  points: { color: '#90978E', fontSize: 11, fontWeight: '700' },
  accountCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginBottom: 12 },
  accountAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EDC0AE', alignItems: 'center', justifyContent: 'center' },
  accountAvatarText: { color: '#765049', fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  accountCopy: { flex: 1 },
  accountName: { color: '#526059', fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', marginBottom: 3 },
  editButton: { paddingHorizontal: 9, paddingVertical: 7 },
  editButtonText: { color: colors.coralDark, fontSize: 11, fontWeight: '700' },
  connectionCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14, backgroundColor: colors.sageSoft, borderWidth: 1, borderColor: '#D9E7D7', marginBottom: 12 },
  connectionCardUnlinked: { backgroundColor: '#FFF3EC', borderColor: '#EFDDD4' },
  connectionIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#D8E7D6', alignItems: 'center', justifyContent: 'center' },
  connectionCopy: { flex: 1 },
  connectionTitle: { color: '#526A57', fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  connectionDescription: { color: '#7B8D7C', fontSize: 11, lineHeight: 16 },
  backendCard: { borderRadius: 14, padding: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginTop: 20 },
  sectionTitle: { color: '#526059', fontFamily: 'Georgia', fontSize: 18, fontWeight: '700' },
  configBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  configBadgeText: { fontSize: 9, fontWeight: '700' },
  lockedState: { minHeight: 500, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, textAlign: 'center' },
  lockOrbit: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.coralSoft, borderWidth: 1, borderColor: '#EFCFC2', alignItems: 'center', justifyContent: 'center', marginBottom: 21 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, paddingHorizontal: 7, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,252,246,.97)', borderTopWidth: 1, borderTopColor: colors.line },
  navItem: { width: '20%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  navLabel: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  navLabelActive: { color: colors.coralDark, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(39,51,47,.32)' },
  modalCard: { padding: 22, paddingBottom: 30, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { color: '#37463F', fontFamily: 'Georgia', fontSize: 26, lineHeight: 29, fontWeight: '700', marginTop: 8 },
  closeButton: { color: '#858B82', fontSize: 30, lineHeight: 30, paddingHorizontal: 4 },
  inputLabel: { color: '#727B73', fontSize: 10, fontWeight: '700', marginBottom: 7, marginTop: 10 },
  input: { width: '100%', paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#E1E0D6', borderRadius: 10, color: '#4E5C53', backgroundColor: '#FFFEF9', fontSize: 13 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 24, paddingTop: 17, borderTopWidth: 1, borderTopColor: '#EEEBE4' },
  switchAuth: { color: colors.coralDark, fontSize: 11, fontWeight: '700', marginTop: 13 },
  toast: { position: 'absolute', left: 17, right: 17, bottom: 88, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 11, backgroundColor: '#F0F7EC', borderWidth: 1, borderColor: '#D8E4D5', flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#334838', shadowOpacity: 0.13, shadowRadius: 12, elevation: 5 },
  toastText: { color: '#4F6C56', fontSize: 11, fontWeight: '700', flex: 1 },
})

export default App
