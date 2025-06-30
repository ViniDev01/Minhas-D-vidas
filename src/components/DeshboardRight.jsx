import React,{ useState, useEffect } from "react";
import { db, storage } from '../firebase/firebaseConfig';
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";

function DeshboardRight({ setDividaSelecionada, isOpen, setIsOpen, refetchTrigger, forcarAtualizacao}) {

    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function carregarDebts() {
            setLoading(true);
            const snapshot = await getDocs(collection(db, "debts"));
            const dados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
        }));
            setDebts(dados);
            setLoading(false);
        }

        if (!isOpen) {
            carregarDebts();
        }
        
    }, [isOpen, refetchTrigger]);

    const excluirDividaComComprovantes = async (dividaId) => {
        const confirmar = confirm("Tem certeza que deseja excluir esta dívida e todos os comprovantes?");
        if (!confirmar) return;

        try {
            // 1. Buscar e excluir todos os comprovantes
            const comprovantesSnap = await getDocs(collection(db, "debts", dividaId, "comprovantes"));
            
            for (const docItem of comprovantesSnap.docs) {
            const compData = docItem.data();

            // Excluir do Firestore
            await deleteDoc(doc(db, "debts", dividaId, "comprovantes", docItem.id));
            
            // Excluir do Storage, se tiver arquivo
            if (compData.arquivo) {
                const urlPath = new URL(compData.arquivo).pathname;
                const pathSemBarra = decodeURIComponent(urlPath.split("/o/")[1].split("?")[0]);
                const arquivoRef = storageRef(storage, pathSemBarra);
                await deleteObject(arquivoRef).catch(() => {}); // ignora se já foi apagado
            }
            }

            // 2. Excluir a dívida
            await deleteDoc(doc(db, "debts", dividaId));
            setDividaSelecionada(null);
            forcarAtualizacao();

            alert("Dívida excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir dívida:", error);
            alert("Erro ao excluir dívida.");
        }
    };


    return (
        <div className="box-right">
            <h1>Suas dívidas</h1>
            {loading ? (
                <p style={{color: "black"}}>Carregando dívidas...</p>
            ) : (debts.map(divida => (
            <div className="card-divida" key={divida.id}>
                <p><strong>Motivo:</strong> {divida.titulo}</p>
                <p><strong>Valor:</strong> {typeof divida.valorTotal === 'number' ? divida.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor inválido'}</p>
                <button onClick={() => {setDividaSelecionada(divida); setIsOpen(!isOpen)}}>Ver detalhes</button>
                <button onClick={() => {excluirDividaComComprovantes(divida.id)}} style={{marginLeft: '30px', backgroundColor: 'red', }}>Excluir</button>
            </div>
            )))}
        </div>
    )
}

export default DeshboardRight;