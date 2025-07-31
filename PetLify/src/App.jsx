import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
function App() {
	return (
		<div className='w-screen h-screen overflow-x-hidden bg-secondary lg:bg-main text-text'>
			<Router>
				<Routes>
					<Route path='/' element={<AuthPage />} />
					<Route path='/main-page' element={<MainPage />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
