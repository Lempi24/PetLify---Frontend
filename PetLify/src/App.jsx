import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
function App() {
	return (
		<div className='w-screen h-screen overflow-x-hidden bg-main text-text'>
			<Router>
				<Routes>
					<Route path='/' element={<LoginPage />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
