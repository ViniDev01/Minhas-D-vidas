import '../App.css'
import { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [lembrarMe, setLembrarMe] = useState(false);
  const navigate = useNavigate();  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Configura onde a sessão será salva, antes do login
      await setPersistence(auth, lembrarMe ? browserLocalPersistence : browserSessionPersistence);

      let userCredential;
      if (isLogin) {
        // LOGIN EXISTENTE
        userCredential = await signInWithEmailAndPassword(auth, email, senha);
        console.log("Login feito com sucesso!");
      } else {
        // CADASTRO
        userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        console.log("Cadastro feito com sucesso!");
      }

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp()
      });

      navigate('./dividas');
    } catch (error) {
      console.error("Erro:", error.message);
    }
  }

  const handleResetPassword = async () => {
    if(!email){
      alert("Por favor, digite seu e-mail para redefinir a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de redefinição enviado! Verifique sua caixa de entrada.");
    } catch(error) {
      console.error("Erro ao enviar email de redefinição:", error);
      alert("Erro ao enviar email de redefinição. Verifique o email digitado.");
    }
  }

  return (
    <div className='container-login'>
      <div className='box-left'>
          <h1>Controle seu dinheiro, conquiste seus sonhos.</h1>
          <p>Gerencie dívidas, acompanhe pagamentos e visualize seus comprovantes em um só lugar.</p>
      </div>

      <div className='box-right'>
          <div className='cardheader'>
            <div className='cardtitulo'>
              <h1>{isLogin ? "Entre na sua conta" : "Registrar sua conta"}</h1>
              <p>{isLogin ? "Digite seu e-mail abaixo para acessar sua conta" : "Crie sua conta usando seu e-mail abaixo"}</p>
            </div>
            <button type='button' onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Inscrever-se" : "Já tenho conta"}
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <label>
              <span>E-mail</span>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              <span>Senha</span>
              <input 
                type="password" 
                name="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </label>
            
            <label>
              <span>Lembrar-me 
                <input 
                  type="checkbox" 
                  name='checkbox' 
                  checked={lembrarMe} 
                  onChange={(e) => setLembrarMe(e.target.checked)}
                />
              </span>
              <span onClick={(e) => {e.preventDefault(); handleResetPassword();}}>Esqueceu a senha?</span>
            </label>

             <button type="submit" className={isLogin ? "btn-login" : "btn-inscrever"}>{isLogin ? 'Entrar' : 'Cadastrar'}</button>
            
          </form>
      </div>
    </div>
  )
}

export default LoginPage;
