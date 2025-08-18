import { useLocation } from 'react-router-dom';
import SubPagesNav from '../components/ui/SubPagesNav';
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
