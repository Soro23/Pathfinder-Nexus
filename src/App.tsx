import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { CharacterNew } from './pages/CharacterNew'
import { CharacterView } from './pages/CharacterView'
import { Rules } from './pages/Rules'
import { PlayMode } from './pages/PlayMode'
import { CharacterImport } from './pages/CharacterImport'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { CampaignList } from './pages/CampaignList'
import { CampaignNew } from './pages/CampaignNew'
import { CampaignView } from './pages/CampaignView'
import { CampaignImport } from './pages/CampaignImport'
import { PartyView } from './pages/PartyView'
import { Admin } from './pages/Admin'
import { Tools } from './pages/Tools'
import { Homebrew } from './pages/Homebrew'
import { Tables } from './pages/Tables'
import { Skills } from './pages/Skills'
import { Feats } from './pages/Feats'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route path="tables" element={<Tables />} />
              <Route path="skills" element={<Skills />} />
              <Route path="feats" element={<Feats />} />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
