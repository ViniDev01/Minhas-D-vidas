import React,{ useState, useRef } from "react";
import { Upload } from 'lucide-react';
import { db, storage } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

function ComprovanteForm({ handleValorPagoChange, valorPago, dividaSelecionada, setValorPago, onSuccess, user }) {

    const [pdfFile, setPdfFile] = useState(null);
    const [dataPaga, setDataPaga] = useState('');
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    async function adicionarComprovante(debtsId) {
        if (!dividaSelecionada?.id) {
            alert("Nenhuma dívida selecionada.");
            return;
        }
        if (!pdfFile || !valorPago || !dataPaga) {
            alert("Preencha todos os campos e selecione um arquivo PDF.");
            return;
        }

        if (loading) return;
        setLoading(true);
        try {
            
            const arquivoRef = ref(storage, `comprovantes/${user.uid}/${debtsId}/${pdfFile.name}`);
            await uploadBytes(arquivoRef, pdfFile);
            const url = await getDownloadURL(arquivoRef);

            const valorNumerico = parseFloat(
                valorPago.replace(/[R$\s.]/g, '').replace(',', '.')
            );
            const [ano, mes, dia] = dataPaga.split("-");
            const dataLocal = new Date(ano, mes - 1, dia);

            const comprovante = {
                valorPago: valorNumerico,
                dataPaga: dataLocal,
                arquivo: url    
            };

            if (isNaN(valorNumerico) || valorNumerico <= 0) {
                alert("Informe um valor pago válido.");
                return;
            }

            await addDoc(collection(db, "users", user.uid, "debts", debtsId, "comprovantes"), comprovante);
            alert("Comprovante enviado com sucesso!");
            if(onSuccess) onSuccess();
            setPdfFile(null);
            inputRef.current.value = null;
            setDataPaga('');
            setValorPago('');
            
        } catch (error) {
            console.error("Erro ao enviar comprovante:", error);
            alert("Erro ao enviar comprovante.");
        } finally {
            setLoading(false);
        }
    }

    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
        setPdfFile(file);
        } else {
        alert("Por favor, selecione um arquivo PDF válido.");
        e.target.value = null; // limpa o input
        }
    };   

    return (
        <div className='container-inputs'>
            <input id="file-upload" type='file' accept="application/pdf" ref={inputRef} onChange={handleFileChange} style={{display: "none"}}/>

            <label htmlFor="file-upload" className='upload' style={{ cursor: 'pointer' }}>
                <Upload /> PDF
            </label>

            {pdfFile && <p>Arquivo selecionado: {pdfFile.name}</p>}

            <input id="input-valor-pago" type='text' placeholder='valor pago' value={valorPago} onChange={handleValorPagoChange}/>

            <input id="input-data-paga" type='date' value={dataPaga} onChange={(e) => setDataPaga(e.target.value)}/>

            <button onClick={() => {adicionarComprovante(dividaSelecionada.id)}} disabled={loading}>{loading ? "Enviando..." : "Contabilizar"}</button>
        </div>
    )
}

export default ComprovanteForm;