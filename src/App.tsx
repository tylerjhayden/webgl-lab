import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Gallery from './components/Gallery'
import ExperimentViewer from './components/ExperimentViewer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Gallery />} />
          <Route path="experiment/:slug" element={<ExperimentViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
