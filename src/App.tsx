import { useUIStore } from '@/store'
import { AppLayout, NavigationHeader, Sidebar } from '@/components/layout'
import { VisualizerPage } from '@/features/visualizer'
import { TopicsPage } from '@/features/topics'
import { QuestionsPage } from '@/features/questions'

function App() {
  const { viewMode } = useUIStore()

  const renderContent = () => {
    switch (viewMode) {
      case 'visualizer':
        return <VisualizerPage />
      case 'topics':
        return <TopicsPage />
      case 'questions':
        return <QuestionsPage />
      default:
        return <VisualizerPage />
    }
  }

  return (
    <AppLayout
      header={<NavigationHeader />}
      sidebar={<Sidebar />}
    >
      {renderContent()}
      <p className="text-center text-gray-500">version 1.0.0</p>
      <p className="text-center text-gray-500">Made by Sagar with ❤️</p>
      <p className="text-center text-gray-500">All rights reserved.</p>
    </AppLayout>
  )
}

export default App
