import React, { useState, useEffect, useMemo } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, doc, deleteDoc, orderBy } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";

function ResumoPagamento({ dividaSelecionada, refetchTrigger, user }) {
    const [comprovantes, setComprovantes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dividaSelecionada) return; 
        if (!dividaSelecionada?.id) {
            setComprovantes([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const comprovantesRef = collection(db, "users", user.uid, "debts", dividaSelecionada.id, "comprovantes");
        const q = query(comprovantesRef, orderBy("dataPaga", "asc"));

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const dados = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComprovantes(dados);
                setLoading(false);
            }, 
            (error) => {
                console.error("Erro ao escutar comprovantes:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [dividaSelecionada?.id, refetchTrigger]); // Adicionei refetchTrigger aqui

    const excluirComprovante = async (comprovanteId, arquivoUrl) => {
        if (!dividaSelecionada?.id || !comprovanteId) return;

        const comfirmacao = confirm("Tem certeza que deseja excluir este comprovante?");
        if(!comfirmacao) return;

        try{

            await deleteDoc(doc(db, "users", user.uid, "debts", dividaSelecionada.id, "comprovantes", comprovanteId));

            if(arquivoUrl) {
                const urlPath = new URL(arquivoUrl).pathname;
                const pathSemBarra = decodeURIComponent(urlPath.split("/o/")[1].split("?")[0]);
                const arquivoRef = storageRef(storage, pathSemBarra);
                await deleteObject(arquivoRef);
            }

            alert("Comprovante excluído com sucesso.");
        } catch(error) {
            console.error("Erro ao excluir comprovante:", error);
            alert("Erro ao excluir comprovante.");
        }
    }

    const totalPago = useMemo(() => {
        return comprovantes.reduce((acc, comp) => {
            let valor = 0;
            
            // Se for número, usa diretamente
            if (typeof comp.valorPago === 'number') {
                valor = comp.valorPago;
            } 
            // Se for string, faz o parse
            else if (typeof comp.valorPago === 'string') {
                // Remove R$, pontos e espaços, substitui vírgula por ponto
                const cleaned = comp.valorPago
                    .replace(/[^\d,-]/g, '')
                    .replace('.', '')
                    .replace(',', '.');
                
                valor = parseFloat(cleaned) || 0;
            }
            
            return acc + valor;
        }, 0);
    }, [comprovantes]);

    const restante = useMemo(() => {
        if (!dividaSelecionada?.valorTotal) return 0;
        return dividaSelecionada.valorTotal - totalPago;
    }, [dividaSelecionada?.valorTotal, totalPago]);

    const abrirPDF = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert('Comprovante não disponível');
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="box-resumo">
            <h2>Resumo do pagamento</h2>

            {comprovantes.length > 0 ? (
                <>
                    {comprovantes.map(comprovante => (
                        <div key={comprovante.id} className='comprovantes'>
                            <p><strong>Valor pago:</strong> 
                                {typeof comprovante.valorPago === 'number' 
                                    ? comprovante.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                    : comprovante.valorPago}
                            </p>
                            <p><strong>Data do pagamento:</strong> {" "} 
                                {comprovante.dataPaga?.toDate 
                                    ? comprovante.dataPaga.toDate().toLocaleDateString() 
                                    : "Data inválida"}
                            </p>
                            <p>
                                <strong>Comprovante:</strong> 
                                <button onClick={() => abrirPDF(comprovante.arquivo)} style={{backgroundColor: 'transparent', color: '#830db5', cursor: 'pointer', border: 'none', marginLeft: '10px'}}>
                                    Ver PDF
                                </button>
                                <button onClick={() => excluirComprovante(comprovante.id, comprovante.arquivo)} style={{ marginLeft: '10px', color: 'red', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '30px' }}>
                                    Excluir
                                </button>
                            </p>
                            <hr />
                        </div>
                    ))}

                    <div className='resutado'>
                        <p>
                            <strong>Valor total da dívida:</strong>{" "}
                            {dividaSelecionada?.valorTotal?.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}
                        </p>

                        <p>
                            <strong>Total pago:</strong>{" "}
                            {totalPago.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}
                        </p>

                        <p>
                            <strong>Restante:</strong>{" "}
                            {restante.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}
                        </p>
                    </div>
                </>
            ) : (
                <p>Nenhum pagamento foi registrado ainda.</p>
            )}
        </div>
    );
}

export default ResumoPagamento;