import Logo from '../components/ui/Logo';
import Form from '../components/features/auth/Form';
const AuthPage = () => {
	return (
		<div className='w-full h-full flex flex-col items-center justify-center'>
			<Logo />
			<Form />
		</div>
	);
};

export default AuthPage;
