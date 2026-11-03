'use client';
import { useEffect, useState } from 'react';
import PersonalDataAccordion from '@/components/conta/DadosPessoaisAccordion';
import DadosEnderecoAccordion from '@/components/conta/DadosEnderecoAccordion';
import ListagemEnderecos from '@/components/conta/ListagemEnderecos';
import PaymentDataAccordion from '@/components/conta/DadosPagamentoAccordion';
import { useEndereco } from '@/data/hooks/useEndereco';

export default function ContaContent() {
    const enderecoState = useEndereco();
    const [enderecoAccordionOpen, setEnderecoAccordionOpen] = useState(false);

    useEffect(() => {
        void enderecoState.carregarEnderecos();
    }, []);

    return (
        <section className="flex flex-col gap-5">
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
                <PersonalDataAccordion />
                <DadosEnderecoAccordion
                    enderecoState={enderecoState}
                    open={enderecoAccordionOpen}
                    onOpenChange={setEnderecoAccordionOpen}/>
                <PaymentDataAccordion />
            </div>
            <div className="border-t pt-5">
                <ListagemEnderecos
                    enderecoState={enderecoState}
                    onEditar={() => setEnderecoAccordionOpen(true)}/>
            </div>
        </section>
    );
}