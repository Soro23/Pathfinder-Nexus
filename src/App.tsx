import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { PageLoader } from './components/layout/PageLoader'

// Cada página se carga en su propio chunk — así la primera pantalla no paga por
// el JS de todas las demás (Admin, Bestiario, Tablas…), solo por la que se visita.
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const CharacterNew = lazy(() => import('./pages/CharacterNew').then(m => ({ default: m.CharacterNew })))
const CharacterView = lazy(() => import('./pages/CharacterView').then(m => ({ default: m.CharacterView })))
const Rules = lazy(() => import('./pages/Rules').then(m => ({ default: m.Rules })))
const SrdSearch = lazy(() => import('./pages/SrdSearch').then(m => ({ default: m.SrdSearch })))
const PlayMode = lazy(() => import('./pages/PlayMode').then(m => ({ default: m.PlayMode })))
const CharacterImport = lazy(() => import('./pages/CharacterImport').then(m => ({ default: m.CharacterImport })))
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const CampaignList = lazy(() => import('./pages/CampaignList').then(m => ({ default: m.CampaignList })))
const CampaignNew = lazy(() => import('./pages/CampaignNew').then(m => ({ default: m.CampaignNew })))
const CampaignView = lazy(() => import('./pages/CampaignView').then(m => ({ default: m.CampaignView })))
const CampaignImport = lazy(() => import('./pages/CampaignImport').then(m => ({ default: m.CampaignImport })))
const PartyView = lazy(() => import('./pages/PartyView').then(m => ({ default: m.PartyView })))
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))
const Tools = lazy(() => import('./pages/Tools').then(m => ({ default: m.Tools })))
const Homebrew = lazy(() => import('./pages/Homebrew').then(m => ({ default: m.Homebrew })))
const Tables = lazy(() => import('./pages/Tables').then(m => ({ default: m.Tables })))
const Skills = lazy(() => import('./pages/Skills').then(m => ({ default: m.Skills })))
const Spells = lazy(() => import('./pages/Spells').then(m => ({ default: m.Spells })))
const Items = lazy(() => import('./pages/Items').then(m => ({ default: m.Items })))
const Feats = lazy(() => import('./pages/Feats').then(m => ({ default: m.Feats })))
const Bestiary = lazy(() => import('./pages/Bestiary').then(m => ({ default: m.Bestiary })))
const Classes = lazy(() => import('./pages/Classes').then(m => ({ default: m.Classes })))
const Races = lazy(() => import('./pages/Races').then(m => ({ default: m.Races })))
const NPCs = lazy(() => import('./pages/NPCs').then(m => ({ default: m.NPCs })))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public pages */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/campaigns/:id/party" element={<PartyView />} />

              {/* App shell with sidebar */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="characters/new" element={<CharacterNew />} />
                <Route path="characters/import" element={<CharacterImport />} />
                <Route path="characters/:id" element={<CharacterView />} />
                <Route path="characters/:id/play" element={<PlayMode />} />
                <Route path="rules" element={<Rules />} />
                <Route path="srd" element={<SrdSearch />} />
                <Route path="tables" element={<Tables />} />
                <Route path="skills" element={<Skills />} />
                <Route path="spells" element={<Spells />} />
                <Route path="items" element={<Items />} />
                <Route path="feats" element={<Feats />} />
                <Route path="bestiary" element={<Bestiary />} />
                <Route path="classes" element={<Classes />} />
                <Route path="classes/:classId" element={<Classes />} />
                <Route path="races" element={<Races />} />
                <Route path="races/:raceId" element={<Races />} />
                <Route path="npcs" element={<NPCs />} />
                <Route path="campaigns" element={<CampaignList />} />
                <Route path="campaigns/new" element={<CampaignNew />} />
                <Route path="campaigns/import" element={<CampaignImport />} />
                <Route path="campaigns/:id" element={<CampaignView />} />
                <Route path="homebrew" element={<Homebrew />} />
                <Route path="admin" element={<Admin />} />
                <Route path="tools" element={<Tools />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
