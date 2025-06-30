import React,{useState} from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from "firebase/firestore";

function DeshboardLeft({ nomeDivida, setNomeDivida, valorDivida, handleValorDividaChange , setValorDivida, setIsOpen, setDividaSelecionada }) {

    const [loading, setLoading] = useState(false);

    function formatarMoedaParaNumero(valor) {
        return parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
    }

    const handleDebts = async () => {
        try {
            const valorNumerico = formatarMoedaParaNumero(valorDivida);

            if (isNaN(valorNumerico) || valorNumerico <= 0) {
                throw new Error("Valor inválido");
            }

            const docRef = await addDoc(collection(db, "debts"), {
                titulo: nomeDivida,
                valorTotal: valorNumerico,
                dataCriacao: new Date()
            });
            setDividaSelecionada({
                id: docRef.id,
                titulo: nomeDivida,
                valorTotal: valorNumerico
            });
            setIsOpen(true);
            setNomeDivida('');
            setValorDivida('');

        } catch (e) {
            console.error("Erro ao adicionar documento:", e);
        }
    }

    const handleClick = async () => {
        try {
            setLoading(true);
            await handleDebts();         // tenta salvar
        } catch (error) {
            console.error("Erro ao registrar dívida:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="box-left">
            <h1>Qual a dívida que você gostaria de pagar</h1>
            <input 
                id='input-nome-divida'
                type='text' 
                value={nomeDivida}
                onChange={(e) => setNomeDivida(e.target.value)}
                placeholder='Pagar minha moto'
            />
            <input 
                id='input-valor-divida'
                type='text' 
                value={valorDivida}
                onChange={handleValorDividaChange }
                placeholder='Valor da minha moto'
            />

            {nomeDivida && valorDivida && (
            <button onClick={handleClick} disabled={loading}>{loading ? 'Salvando...' : 'Entrar'}</button>
            )}
        </div>
    )
}

export default DeshboardLeft;