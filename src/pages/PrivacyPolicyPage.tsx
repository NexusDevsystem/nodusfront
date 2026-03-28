
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Voltar para Nodus</span>
                    </Link>
                    <div className="font-bold text-xl tracking-tight text-slate-900">Nodus.cc</div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Política de Privacidade</h1>
                <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-slate max-w-none">
                    <p>
                        A sua privacidade é importante para nós. É política do Nodus respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="https://noduscc.com.br">Nodus.cc</a>, e outros sites que possuímos e operamos.
                    </p>

                    <h3>1. Informações que coletamos</h3>
                    <p>
                        Coletamos informações pessoais que você nos fornece voluntariamente ao se registrar e utilizar o Nodus:
                    </p>
                    <ul>
                        <li><strong>Dados de Conta:</strong> Nome, e-mail, foto de perfil e senhas criptografadas.</li>
                        <li><strong>Perfil e Bio:</strong> Informações biográficas, links sociais e personalizações de layout.</li>
                        <li><strong>Dados de Loja e Catálogo:</strong> Fotos de produtos, descrições, preços e informações de estoque.</li>
                        <li><strong>Dados de Transações:</strong> Histórico de ordens, chaves Pix fornecidas e e-mails de pagamento (AbacatePay/PayPal).</li>
                    </ul>

                    <h3>2. Integrações com Terceiros</h3>
                    <p>
                        O Nodus permite a integração com diversas plataformas para enriquecer seu perfil:
                    </p>
                    <ul>
                        <li><strong>Google (YouTube):</strong> Acessamos dados públicos do canal (inscritos, título) via API para exibição de estatísticas.</li>
                        <li><strong>Instagram:</strong> Quando conectado, acessamos informações básicas de perfil e mídia para integração de feed ou links.</li>
                        <li><strong>Serviços de Pagamento:</strong> Utilizamos AbacatePay e PayPal para processamento de cobranças e assinaturas. Seus dados de cartão são processados diretamente por esses provedores; o Nodus não armazena dados sensíveis de pagamento.</li>
                    </ul>
                    <p>
                        O uso das informações recebidas de APIs de terceiros adere às respectivas políticas de dados (como a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política de Dados do Usuário do Google</a>).
                    </p>

                    <h3>3. Como usamos suas informações</h3>
                    <p>
                        Usamos suas informações para:
                    </p>
                    <ul>
                        <li>Fornecer, operar e manter seu perfil público e painel administrativo;</li>
                        <li>Processar vendas e gerenciar o catálogo da sua loja;</li>
                        <li>Permitir que compradores entrem em contato com você após uma compra;</li>
                        <li>Melhorar, personalizar e expandir as funcionalidades da plataforma;</li>
                        <li>Entender e analisar estatísticas de acesso ao seu perfil;</li>
                        <li>Garantir a segurança e prevenir fraudes ou abusos.</li>
                    </ul>

                    <h3>4. Compartilhamento de Dados</h3>
                    <p>
                        O Nodus <strong>não vende</strong> seus dados pessoais. Compartilhamos informações apenas:
                    </p>
                    <ul>
                        <li><strong>Com Compradores/Vendedores:</strong> Em caso de venda na plataforma, os dados necessários para a entrega (nome, e-mail, endereço se aplicável) são compartilhados entre as partes interessadas.</li>
                        <li><strong>Com Provedores de Serviço:</strong> Hospedagem, processamento de pagamentos e ferramentas de análise.</li>
                        <li><strong>Por Requisito Legal:</strong> Quando exigido por lei ou para proteger direitos.</li>
                    </ul>

                    <h3>5. Segurança</h3>
                    <p>
                        Adotamos práticas de segurança de padrão de mercado, incluindo criptografia SSL e armazenamento seguro de senhas (hashing), para proteger suas informações. No entanto, nenhum sistema é 100% impenetrável.
                    </p>

                    <h3>6. Seus Direitos</h3>
                    <p>
                        Você pode, a qualquer momento, editar ou excluir suas informações através do painel do Nodus. Caso deseje a exclusão permanente de sua conta e todos os dados associados, entre em contato conosco.
                    </p>

                    <h3>7. Cookies</h3>
                    <p>
                        Usamos cookies essenciais para manter sua sessão ativa e ferramentas de análise para entender o fluxo de uso da plataforma e otimizar a experiência.
                    </p>

                    <h3>8. Contato</h3>
                    <p>
                        Dúvidas sobre privacidade? <a href="mailto:contato@noduscc.com.br">contato@noduscc.com.br</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}
