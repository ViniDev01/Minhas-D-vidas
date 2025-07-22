import { useState } from 'react'
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


// COMPONENTS
import Header from '../components/Header';
import DeshboardLeft from '../components/DashboardLeft';
import DeshboardRight from '../components/DeshboardRight';
import ComprovanteForm from '../components/ComprovanteForm';
import ResumoPagamento from '../components/ResumoPagamento';

function DividasPage() {

    const { user } = useAuth();
    const [nomeDivida, setNomeDivida] = useState('');
    const [valorDivida, setValorDivida] = useState('');
    const [valorPago, setValorPago] = useState('');
    const [dividaSelecionada, setDividaSelecionada] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const forcarAtualizacao = () => setRefetchTrigger(prev => prev + 1);

    

    const handleValorDividaChange = (e) => {
      let valor = e.target.value.replace(/\D/g, '');
      if (!valor || parseInt(valor) === 0) {
        setValorDivida('');
        return;
      }

      const valorNumerico = parseFloat(valor) / 100;
      const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      setValorDivida(valorFormatado);
    };

    const handleValorPagoChange = (e) => {
      let valor = e.target.value.replace(/\D/g, '');
      if (!valor || parseInt(valor) === 0) {
        setValorPago('');
        return;
      }

      const valorNumerico = parseFloat(valor) / 100;
      const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      setValorPago(valorFormatado);
    };


    return (
      <>
        <Header />

          <div className='container-dashboard' style={{ display: isOpen ? 'none' : 'flex' }}>
            <DeshboardLeft 
              nomeDivida={nomeDivida} 
              setNomeDivida={setNomeDivida} 
              valorDivida={valorDivida} 
              handleValorDividaChange ={handleValorDividaChange }
              setValorDivida={setValorDivida}
              setIsOpen={setIsOpen}
              setDividaSelecionada={setDividaSelecionada}
              user={user}
            />

            <DeshboardRight 
              setDividaSelecionada={setDividaSelecionada}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              // dividaSelecionada={dividaSelecionada}
              refetchTrigger={refetchTrigger}
              forcarAtualizacao={forcarAtualizacao}
              user={user}
            />
          </div>        
      
        <div style={{ display: isOpen ? 'block' : 'none' }}>
          <>
            <ArrowLeft onClick={() => setIsOpen(!isOpen)}/>
            
            <ComprovanteForm 
              handleValorPagoChange={handleValorPagoChange}
              valorPago={valorPago}
              dividaSelecionada={dividaSelecionada}
              setValorPago={setValorPago}
              onSuccess={forcarAtualizacao}
              user={user}
            />

            <ResumoPagamento 
              dividaSelecionada={dividaSelecionada} 
              refetchTrigger={refetchTrigger}
              key={refetchTrigger}
              user={user}
            />

          </>
        </div>
        
      </>
    );
}

export default DividasPage;