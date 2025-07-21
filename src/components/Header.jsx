import { Link } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo2.png"

function Header() {
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate('/')
      } catch (error) {
        console.error('Erro ao deslogar:', error);
      }
    }

    return(
        <div className='header'>
          <div className='logo'><img src={logo} alt="" style={{width: '80px', height: '80px',
    objectFit: 'cover'}}/></div>
          <button onClick={handleLogout}>Sair</button>
        </div>
    )
}

export default Header;