import { useLocation } from 'react-router-dom';
import SubPagesNav from '../components/SubPagesNav';
const ReportsPage = () => {
	const location = useLocation();
	const currentPath = location.pathname;
	return (
		<div>
			<SubPagesNav currentPath={currentPath} />
			<div></div>
		</div>
	);
};
export default ReportsPage;
