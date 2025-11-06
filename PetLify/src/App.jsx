import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import AuthPage from './pages/AuthPage'
import MainPage from './pages/MainPage'
import SettingsPage from './pages/SettingsPage'
import ChatsPage from './pages/ChatsPage'
import ReportsPage from './pages/ReportsPage'
import CreateLostFormPage from './pages/CreateLostFormPage'
import CreateFoundFormPage from './pages/CreateFoundFormPage'
import PetProfilesPage from './pages/PetProfilesPage'
import AdminPanel from './pages/AdminPanel'
import ManageLostReports from './components/features/auth/admin/ManageLostReports'
import ManageFoundReports from './components/features/auth/admin/ManageFoundReports'
import ManagePermissions from './components/features/auth/admin/ManagePermissions'

function App() {
	return (
		<div className='w-screen h-screen overflow-x-hidden bg-secondary lg:bg-main text-text'>
			<ToastContainer
				position='top-center'
				autoClose={3000}
				hideProgressBar={false}
				closeOnClick={true}
				className={'toastify-container'}
			/>
			<Router>
				<Routes>
					<Route path='/' element={<AuthPage />} />
					<Route path='/main-page' element={<MainPage />} />
					<Route path='/main-page/create-lost-form' element={<CreateLostFormPage />}/>
					<Route path='/main-page/create-found-form' element={<CreateFoundFormPage />}/>
					<Route path='/settings' element={<SettingsPage />} />
					<Route path='/chats' element={<ChatsPage />} />
					<Route path='/reports' element={<ReportsPage />} />
					<Route path='/pet-profiles' element={<PetProfilesPage />} />
					<Route path='/admin-panel' element={<AdminPanel />} />
					<Route path='/admin-panel/manage-lost-reports' element={<ManageLostReports />} />
					<Route path='/admin-panel/manage-found-reports' element={<ManageFoundReports />} />
					<Route path='/admin-panel/manage-permissions' element={<ManagePermissions />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
