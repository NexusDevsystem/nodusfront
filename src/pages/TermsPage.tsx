
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
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
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Termos de Uso</h1>
                <p className="text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <div className="prose prose-slate max-w-none">
                    <h3>1. Termos e Aceitação</h3>
                    <p>
                        Ao acessar o site <a href="https://noduscc.com.br">Nodus</a>, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. O Nodus é uma plataforma que permite a criação de perfis agregadores de links e lojas virtuais.
                    </p>

                    <h3>2. Responsabilidade pelo Conteúdo</h3>
                    <p>
                        Como usuário, você é o <strong>único responsável</strong> por todo o conteúdo publicado em seu perfil, incluindo:
                    </p>
                    <ul>
                        <li>Links externos e redirecionamentos;</li>
                        <li>Imagens, textos e vídeos utilizados na customização;</li>
                        <li>Produtos cadastrados em sua loja (físicos ou digitais);</li>
                        <li>Legalidade dos produtos vendidos e cumprimento de prazos de entrega.</li>
                    </ul>
                    <p>
                        O Nodus reserva-se o direito de remover qualquer conteúdo ou banir contas que promovam atividades ilegais, golpes, discurso de ódio ou venda de produtos proibidos sem aviso prévio.
                    </p>

                    <h3>3. Transações e Pagamentos</h3>
                    <p>
                        O Nodus facilita a exposição de produtos, mas as transações financeiras ocorrem através de provedores terceiros (AbacatePay, PayPal ou transferências diretas via Pix).
                    </p>
                    <ul>
                        <li><strong>Disputas:</strong> O Nodus não intervém em disputas comerciais entre compradores e vendedores. Problemas com produtos ou reembolsos devem ser tratados diretamente com o vendedor ou através do processador de pagamentos.</li>
                        <li><strong>Taxas:</strong> O Nodus pode cobrar taxas de assinatura ou comissão sobre vendas, conforme o plano contratado. Essas taxas são comunicadas de forma transparente no painel administrativo.</li>
                    </ul>

                    <h3>4. Propriedade Intelectual</h3>
                    <p>
                        O Nodus é um software proprietário. Você mantém os direitos sobre seu conteúdo original, mas concede ao Nodus uma licença mundial para exibir e distribuir esse conteúdo conforme necessário para fornecer o serviço.
                        <strong>É proibido:</strong> tentar copiar o código-fonte, fazer engenharia reversa ou utilizar a marca Nodus de forma a sugerir parceria oficial sem autorização.
                    </p>

                    <h3>6. Assinaturas, Renovação e Cancelamento</h3>
                    <p>
                        O site <a href="https://nodus.my">Nodus.my</a> opera com um modelo de assinatura recorrente manual processada exclusivamente via PIX.
                    </p>
                    <ul>
                        <li><strong>Faturamento:</strong> Não há cobrança automática. Cabe ao usuário realizar o pagamento do código PIX gerado pelo sistema para renovar seu acesso PRO. O sistema oferece uma carência de até 3 (três) dias após o vencimento para a regularização do pagamento antes do downgrade automático.</li>
                        <li><strong>Cancelamento Voluntário:</strong> O usuário pode interromper a renovação futura a qualquer momento através do painel. Neste caso, o acesso aos recursos PRO permanece ativo até as 23:59 do último dia do ciclo já pago. Não há estorno ou reembolso proporcional por dias não utilizados em cancelamentos voluntários.</li>
                        <li><strong>Direito de Arrependimento (CDC):</strong> Exclusivamente para a primeira contratação do serviço, o usuário pode solicitar o reembolso integral em até 7 (sete) dias corridos após o pagamento, conforme o Art. 49 do Código de Defesa do Consumidor. Caso o reembolso seja processado, o downgrade para o plano Free e a perda do acesso aos recursos PRO ocorrem de forma imediata.</li>
                    </ul>

                    <h3>6. Isenção de Responsabilidade</h3>
                    <p>
                        Os materiais no site da Nodus são fornecidos 'como estão'. O Nodus não oferece garantias de que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por perdas financeiras decorrentes do uso da plataforma ou de falhas em integrações de terceiros.
                    </p>

                    <h3>7. Modificações dos Termos</h3>
                    <p>
                        Podemos revisar estes termos a qualquer momento. O uso continuado da plataforma após alterações significa que você aceita os novos termos.
                    </p>

                    <h3>8. Lei Aplicável</h3>
                    <p>
                        Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca da sede da empresa proprietária do Nodus para dirimir quaisquer questões relativas a estes termos.
                    </p>
                </div>
            </main>
        </div>
    );
}
