import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
function App() {
	return (
		<div className='w-screen h-screen overflow-x-hidden bg-main text-text'>
			<Router>
				<Routes>
					<Route path='/' element={<AuthPage />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
