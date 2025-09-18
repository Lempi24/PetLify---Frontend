import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import SettingsPage from './pages/SettingsPage';
import ChatsPage from './pages/ChatsPage';
import ReportsPage from './pages/ReportsPage';
import CreateLostFormPage from './pages/CreateLostFormPage';

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
					<Route
						path='/main-page/create-lost-form'
						element={<CreateLostFormPage />}
					/>
					<Route path='/settings' element={<SettingsPage />} />
					<Route path='/chats' element={<ChatsPage />} />
					<Route path='/reports' element={<ReportsPage />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
