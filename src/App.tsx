import { MainLayout } from '@/components/layout/MainLayout'
import NiceModal from '@ebay/nice-modal-react'

function App() {
    return <div>
        <NiceModal.Provider>
            <MainLayout />
        </NiceModal.Provider>
    </div>
}

export default App
